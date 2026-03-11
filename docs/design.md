# humandbs-editor 設計書

## 概要

humandbs プロジェクトの structured-json データを Web UI で閲覧・編集するエディタ。
現行の「TSV export -> Google Sheets 編集 -> TSV import」ワークフローを置き換え、専用 UI による効率的な curation 作業を実現する。

## 背景と動機

humandbs の crawler が生成する structured-json は、research/dataset/experiment の3階層でゲノムデータベースのメタデータを管理している。現行の curation ワークフローでは:

- structured-json を 12 種の TSV にエクスポート
- Google Sheets にアップロードして手動編集
- TSV をダウンロードして import-tsv で JSON に書き戻す

この手順には以下の課題がある:

- JSON 配列や ICD-10 付き disease 等の複雑なフィールドを手打ちする必要がある
- editable/read-only の区別がピンク背景のみで誤編集リスクがある
- 12 ファイルに分散していて全体像が掴みにくい
- curation 完了状態の管理手段がない
- export/upload/download/import の手順が煩雑

## アーキテクチャ

```
+-------------------+   proxy   +----------------+        +-------------------+
| Vite dev server   | --------> | Express API    | <-FS-> | structured-json/  |
|   /*  SPA (HMR)   |  /api/*   | server         |        +-------------------+
+-------------------+           |                | <-FS-> | editor-state.json |
        |                       +----------------+        +-------------------+
        +--- localStorage (userName) ---+
```

Vite dev server が SPA を配信し、`/api/*` を Express API server にプロキシする。本番でも同じ構成で動かす (ビルド不要)。中央サーバー型で、複数ユーザーがブラウザからアクセスする。

### コンポーネント

| コンポーネント | 役割 |
|---|---|
| Vite dev server | SPA 配信 + `/api/*` プロキシ |
| Express API server | structured-json の読み書き、curation 状態管理 |
| localStorage | ユーザー名の保存。`humandbs-editor-userName` キー |
| structured-json/ | humandbs crawler が出力するデータ。このエディタの入出力 |
| editor-state.json | curation 状態など editor 固有のメタデータ。structured-json とは別管理 |

### データフロー

```
                   humandbs
                   crawler
                      |
                      v
+----------------------------------------------+
| structured-json/                             |
|   research/hum0001.json                      |
|   research-version/hum0001-v1.json           |
|   dataset/JGAD000001-v1.json                 |
+----------------------------------------------+
        ^                    |
        | write              | read
        |                    v
+----------------------------------------------+
| API server                                   |
|   GET  /api/researches                       |
|   GET  /api/researches/:humId                |
|   PUT  /api/researches/:humId                |
|   GET  /api/datasets/:datasetId              |
|   PUT  /api/datasets/:datasetId              |
|   GET  /api/curation-status                  |
|   PUT  /api/curation-status/:id              |
+----------------------------------------------+
        ^                    |
        | HTTP               | HTTP
        |                    v
+----------------------------------------------+
| SPA (browser)                                |
+----------------------------------------------+
```

## 技術スタック

| 分類 | 技術 |
|---|---|
| Frontend | Vite, React, TypeScript |
| UI | MUI (Material-UI) |
| 状態管理 | Jotai, TanStack React Query |
| ルーティング | TanStack React Router |
| フォーム | React Hook Form |
| ユーザー識別 | localStorage (手動入力ユーザー名) |
| Backend | Node.js, Express |
| パッケージ管理 | npm |
| テスト | vitest, fast-check |
| Lint/Format | eslint, @stylistic/eslint-plugin |
| バリデーション | Zod |

## データモデル

### structured-json (humandbs 由来)

3 種類のエンティティ:

- **research** (`research/{humId}.json`): 研究プロジェクト単位のメタデータ
- **research-version** (`research-version/{humId}-v{N}.json`): research のバージョン履歴
- **dataset** (`dataset/{datasetId}-v{N}.json`): データセット。research に紐づく

型定義は humandbs の `apps/backend/src/crawler/types/structured.ts` が SSOT。
本プロジェクトでは必要なスキーマを Zod で再定義し、humandbs の型と互換性を保つ。

### editor-state.json (editor 固有)

curation 状態と editing lock を管理する。structured-json には手を加えない。

```typescript
// editor-state.json の構造
{
  researches: {
    [humId: string]: {
      status: "uncurated" | "in-progress" | "curated" // derived from sectionStatuses
      sectionStatuses?: Record<string, "uncurated" | "curated"> // per-section status
      updatedAt: string // ISO 8601
      editingBy: string | null // Keycloak sub (user ID)
      editingByName: string | null // display name
      editingAt: string | null // ISO 8601
    }
  },
  datasets: {
    [datasetId-version: string]: {
      status: "uncurated" | "in-progress" | "curated"
      updatedAt: string // ISO 8601
      editingBy: string | null
      editingByName: string | null
      editingAt: string | null
    }
  },
  experiments: {
    [datasetId-version-experimentIndex: string]: {
      status: "uncurated" | "in-progress" | "curated"
      updatedAt: string // ISO 8601
    }
  }
}
```

新しい entry が structured-json に追加された場合、editor-state に該当キーが存在しなければ `uncurated` として扱う。明示的に全件登録する必要はない。

### ユーザー識別

認証 (Keycloak) は使わず、localStorage に手動入力したユーザー名で識別する。

- 初回アクセス時にユーザー名入力ダイアログを表示
- `localStorage` の `humandbs-editor-userName` キーに保存
- `editingBy` = `editingByName` = ユーザー名
- AppHeader にユーザー名を表示。クリックで変更可能

### editing lock (悲観的ロック)

同じ research を複数ユーザーが同時に編集することを防ぐ。

- 編集画面を開くときに lock を取得 (`editingBy`, `editingAt` をセット)
- 保存または画面離脱時に lock を解放
- heartbeat: 5 分ごとに `POST /api/lock/research/:humId` で `editingAt` を更新
- ページ離脱時: `fetch(DELETE, { keepalive: true })` で lock 解放
- ブラウザクラッシュ時は 30 分タイムアウトで自動失効
- 他のユーザーが lock 中の entry を開こうとした場合、3 択ダイアログを表示:
  - 「戻る」: 一覧画面に戻る
  - 「閲覧のみで開く」: readOnly モードで開く
  - 「強制的に編集する」: lock を奪取して編集モードで開く
- Research lock が配下の Dataset 編集も含む。Dataset 個別の lock は使わない

### 楽観的ロック

悲観的ロック (editing lock) のセーフティネットとして、PUT 時にファイルの mtime を比較する。

- GET レスポンスに `X-Modified-At` ヘッダーでファイル mtime (ISO 8601) を返す
- PUT 時にカスタムヘッダー `X-Base-Modified-At` でクライアントが保持する mtime を送信
- サーバーが `fs.stat(file).mtime` と比較し、不一致なら 409 Conflict を返す
- ヘッダーなしの PUT は後方互換のため許可する

## 画面構成

| 画面 | パス | 仕様書 |
|---|---|---|
| 一覧画面 | `/` | [research-list](views/research-list.md) |
| research 編集画面 | `/research/:humId` | [research-edit](views/research-edit.md) |
| dataset 編集 | Research 編集画面内ダイアログ | [dataset-edit](views/dataset-edit.md) |

### 編集ワークフロー

編集はクライアント側で保持し、明示的な確定操作まで API server に write しない。

```
open       edit       confirm
 |          |           |
 v          v           v
load  ->  in-memory  -> PUT /api/...
(GET)     (React state) (write to FS)
                 |
             [undo] -> revert to loaded state
```

1. **編集画面を開く**: `GET` で現在のデータを取得
2. **編集**: フォームの変更はクライアントの React state にのみ保持。API server への書き込みは発生しない
3. **確定**: 保存ボタン押下 → 確認ダイアログ → `PUT` で API server に送信し、structured-json に書き込む
4. **undo**: 編集中いつでも、読み込み時の状態に戻せる。未保存の変更をすべて破棄する
5. **離脱警告**: 未保存の変更がある状態でページ遷移・リロードしようとすると確認ダイアログを表示する

#### Dataset 編集の統合

Dataset の編集状態は Jotai atom (`datasetsServerAtom` / `datasetsDraftAtom`) で Research と統合管理される。

- Research の**保存**で配下の変更された Dataset も一括保存される
- Research の**変更を破棄**で配下の Dataset の変更もすべて破棄される
- 各 Dataset は個別にも保存・破棄可能（DatasetCard ヘッダーのボタン）
- dirty 判定は Research + Versions + Datasets を統合した `dirtyAtom` で一元管理される

## API 設計

### Research

| Method | Path | 説明 |
|---|---|---|
| GET | `/api/researches` | research 一覧 (humId, title, dataset 数) |
| POST | `/api/researches` | research 新規作成 (humId はユーザーが指定) |
| GET | `/api/researches/:humId` | research 詳細 (全フィールド) |
| PUT | `/api/researches/:humId` | research 更新 (editable フィールドのみ) |
| DELETE | `/api/researches/:humId` | research 削除 (JSON ファイルを削除) |
| GET | `/api/researches/:humId/original` | humandbs 元ページをプロキシ (header/footer 除去) |

### Research Version

| Method | Path | 説明 |
|---|---|---|
| GET | `/api/researches/:humId/versions` | version 一覧 |
| GET | `/api/researches/:humId/versions/:version` | version 詳細 |
| PUT | `/api/researches/:humId/versions/:version` | version 更新 (releaseNote) |

### Dataset

| Method | Path | 説明 |
|---|---|---|
| GET | `/api/datasets` | 全 datasetId のユニーク一覧。レスポンス: `{ datasetIds: string[] }` |
| POST | `/api/datasets` | dataset 新規作成 (datasetId はユーザーが指定、humId を紐づけ) |
| GET | `/api/datasets/:datasetId` | dataset 詳細 (experiments 含む) |
| PUT | `/api/datasets/:datasetId` | dataset 更新 (experiments 含む) |
| DELETE | `/api/datasets/:datasetId` | dataset 削除 (JSON ファイルを削除) |

### Curation Status

| Method | Path | 説明 |
|---|---|---|
| GET | `/api/curation-status` | 全 curation 状態 |
| PUT | `/api/curation-status/research/:humId` | research の curation 状態更新 |
| PUT | `/api/curation-status/dataset/:datasetId` | dataset の curation 状態更新 |
| PUT | `/api/curation-status/experiment/:datasetId/:index` | experiment の curation 状態更新 |

### Editing Lock

| Method | Path | 説明 |
|---|---|---|
| POST | `/api/lock/research/:humId` | research の lock 取得 / heartbeat / 奪取 |
| DELETE | `/api/lock/research/:humId` | research の lock 解放 |

#### POST /api/lock/research/:humId

```
Body: { userName: string, force?: boolean }

200: { editingBy, editingByName, editingAt }  -- lock 取得成功 / heartbeat
409: { error, editingBy, editingByName, editingAt }  -- 他ユーザー lock 中
```

- editingBy === null || expired -> lock 取得
- editingBy === userName -> heartbeat (editingAt 更新)
- editingBy !== userName && !expired && !force -> 409
- editingBy !== userName && force === true -> lock 奪取

#### DELETE /api/lock/research/:humId

```
Body: { userName: string }

200: { released: true }
```

- editingBy === userName の場合のみ null にリセット
- それ以外は何もせず 200 (冪等)

### Facet Values

| Method | Path | 説明 |
|---|---|---|
| GET | `/api/facet-values` | フィールドごとの既存値一覧を返す |

structured-json 全体をスキャンし、タグ入力対象のフィールド (assayType, tissues, fileTypes 等) について既存の値を収集して返す。タグ入力 widget の autocomplete 候補として使用する。

### Refresh

| Method | Path | 説明 |
|---|---|---|
| POST | `/api/refresh` | structured-json ディレクトリを再スキャンし、新規 entry を検知 |

## 新規 entry の追加への対応

crawler が structured-json に新しいファイルを追加するケースに対応する。

- API サーバーはリクエストごとにファイルシステムから読み込む（メモリキャッシュしない、またはキャッシュする場合は invalidation 可能にする）
- `POST /api/refresh` で明示的にディレクトリを再スキャンできる
- editor-state.json に存在しない entry は `uncurated` として扱う
- 編集中のデータと新規追加データは humId/datasetId が異なるため衝突しない

## 起動方法

```bash
# structured-json ディレクトリのパスを環境変数で指定
STRUCTURED_JSON_DIR=/path/to/humandbs/apps/backend/crawler-results/structured-json \
npm run dev
```

`npm run dev` で Vite dev server と Express API server を同時に起動する。

## Searchable フィールドのヘルプ UI

SearchableFieldsEditor の各フィールドに日本語ラベルと説明を追加し、curator が迷わず入力できるようにする。

### フィールドラベルの日本語化

フォームの各フィールドラベルを日本語に変更する。

### セクションヘッダーのヘルプボタン

各セクション見出し（「実験の概要」等）の右側、ProgressChip の左に `HelpOutline` アイコンボタンを配置する。クリックで説明エリアを `Collapse` でトグル表示する。

説明エリアは Chip 形式で、各フィールドの日本語名と簡潔な説明を並べる。背景色は `action.hover` で軽く区別する。

```
┌─ 実験の概要 ──────────── [?] [3/5] ─┐
│                                       │
│  [アッセイタイプ: WGS, WES 等]        │  ← ? を押すとトグル表示
│  [組織・検体タイプ: 検体の組織名]     │
│  [疾患: 疾患名 + ICD-10]             │
│  [健康状態: healthy/affected/mixed]   │
│  [腫瘍有無: 腫瘍組織が含まれるか]    │
│                                       │
│  アッセイタイプ  [________________]   │
│  ...                                  │
└───────────────────────────────────────┘
```

### フィールド定義一覧

| セクション | キー | 日本語ラベル | 説明 |
|---|---|---|---|
| 実験の概要 | assayType | アッセイタイプ | 実験手法 (WGS, WES, RNA-seq, ChIP-seq 等) |
| | tissues | 組織・検体タイプ | 生体サンプルの組織名 (tumor tissue, peripheral blood 等) |
| | diseases | 疾患 | 対象疾患と ICD-10 コード。健常者のみの場合は空 |
| | healthStatus | 健康状態 | 対象者の健康状態 (healthy / affected / mixed) |
| | isTumor | 腫瘍有無 | 腫瘍組織が含まれるか (tumor / normal / mixed) |
| 被験者 | subjectCount | 対象者数 | 対象者またはサンプルの総数。複数グループの場合は合計 |
| | subjectCountType | カウント方式 | 個人数 (individual) かサンプル数 (sample) か |
| | sex | 性別 | 生物学的性別 (male / female / mixed) |
| | ageGroup | 年齢層 | 年齢グループ (infant / child / adult / elderly / mixed) |
| | population | 集団 | 民族・集団情報 (Japanese, European 等) |
| | cellLine | 細胞株 | 使用した細胞株名 |
| プラットフォーム・手法 | platforms | プラットフォーム | シーケンサーのベンダーとモデル (Illumina NovaSeq 6000 等) |
| | libraryKits | ライブラリキット | ライブラリ調製に使用したキット名 |
| | readType | リード方式 | single-end / paired-end / mixed |
| | readLength | リード長 (bp) | シーケンシングのリード長 (塩基対数) |
| シーケンシング品質 | sequencingDepth | シーケンシング深度 | 平均カバレッジ (例: 30x) |
| | targetCoverage | ターゲットカバレッジ (%) | ターゲット領域のカバー率 |
| | referenceGenome | リファレンスゲノム | 使用したリファレンスゲノム (hg19, hg38, GRCh38 等) |
| | variantCounts | バリアント数 | 検出されたバリアントの数 (SNV / indel / CNV / SV / 合計) |
| | hasPhenotypeData | フェノタイプデータ有無 | 臨床・表現型データが含まれるか |
| | targets | ターゲット領域 | 対象とする遺伝子パネルやターゲット領域の名称 |
| データ形式 | fileTypes | ファイル形式 | 生データのファイル形式 (FASTQ, BAM, CRAM 等) |
| | processedDataTypes | 処理済みデータ | 処理済みデータの形式 (VCF, gVCF 等) |
| | dataVolumeGb | データ容量 (GB) | 総データ量 (ギガバイト単位) |
| ポリシー | policies | ポリシー | データアクセスポリシー (ID・名称・URL) |
