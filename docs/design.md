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
| Express API server | structured-json の読み書き、curation 状態管理、editing lock |
| localStorage | ユーザー名の保存。`humandbs-editor-userName` キー |
| structured-json/ | humandbs crawler が出力するデータ。このエディタの入出力 |
| editor-state.json | curation 状態・editing lock など editor 固有のメタデータ。structured-json とは別管理 |

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
|   GET  /api/researches/:humId/versions       |
|   PUT  /api/researches/:humId/versions       |
|   GET  /api/researches/:humId/original       |
|   GET  /api/datasets                         |
|   GET  /api/datasets/:datasetKey             |
|   POST /api/datasets                         |
|   PUT  /api/datasets/:datasetKey             |
|   DELETE /api/datasets/:datasetKey           |
|   GET  /api/curation-status/research/:humId  |
|   PUT  /api/curation-status/research/:humId  |
|   POST /api/lock/research/:humId             |
|   DELETE /api/lock/research/:humId           |
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
      status: "uncurated" | "in-progress" | "curated" // sectionStatuses から導出
      sectionStatuses?: Record<string, "uncurated" | "curated"> // セクション別状態
      updatedAt: string // ISO 8601
      editingBy: string | null // ユーザー名
      editingByName: string | null // ユーザー名 (表示用、editingBy と同値)
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
  }
}
```

editor-state.json に該当キーが存在しなければ `uncurated` として扱う。

### ユーザー識別

localStorage に手動入力したユーザー名で識別する。

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

## 画面構成

| 画面 | パス | 仕様書 |
|---|---|---|
| 一覧画面 | `/` | [research-list](views/research-list.md) |
| research 編集画面 | `/research/:humId` | [research-edit](views/research-edit.md) |
| dataset 編集 | Research 編集画面内 (Dataset タブ) | [dataset-edit](views/dataset-edit.md) |

### 編集ワークフロー

編集はクライアント側で保持し、明示的な確定操作まで API server に write しない。

```
open       edit       confirm
 |          |           |
 v          v           v
load  ->  in-memory  -> PUT /api/...
(GET)     (Jotai atoms) (write to FS)
                 |
             [undo] -> revert to loaded state
```

1. **編集画面を開く**: `GET` で現在のデータを取得し、Jotai atom (server/draft) に保存
2. **編集**: フォームの変更は draft atom にのみ保持。API server への書き込みは発生しない
3. **確定**: 保存ボタン押下 → 確認ダイアログ → `PUT` で API server に送信し、structured-json に書き込む
4. **undo**: 編集中いつでも、読み込み時の状態に戻せる。未保存の変更をすべて破棄する
5. **離脱警告**: 未保存の変更がある状態でページ遷移・リロードしようとすると確認ダイアログを表示する

#### 状態管理

Jotai の server/draft/dirty atom パターンで Research・Versions・Datasets を統合管理する:

| Atom | 役割 |
|---|---|
| `researchServerAtom` | サーバーから取得した Research データ |
| `researchDraftAtom` | 編集中のコピー |
| `versionsServerAtom` | サーバーから取得した ResearchVersion 配列 |
| `versionsDraftAtom` | 編集中のコピー |
| `datasetsServerAtom` | サーバーから取得した Dataset マップ (`Record<datasetKey, Dataset>`) |
| `datasetsDraftAtom` | 編集中のコピー |
| `dirtyAtom` | server と draft が異なるか (derived atom、`fast-deep-equal` で比較) |

- Research の**保存**で配下の変更された Versions・Datasets も一括保存される
- Research の**変更を破棄**で配下の Versions・Datasets の変更もすべて破棄される
- 各 Dataset は個別にも保存・破棄可能 (DatasetCard ヘッダーのボタン)

## API 設計

### Research

| Method | Path | 説明 |
|---|---|---|
| GET | `/api/researches` | research 一覧 (humId, title, dataset 数, lock 状態等) |
| GET | `/api/researches/:humId` | research 詳細 (全フィールド) |
| PUT | `/api/researches/:humId` | research 更新 |
| GET | `/api/researches/:humId/original` | humandbs 元ページをプロキシ (header/footer 除去) |

### Research Version

| Method | Path | 説明 |
|---|---|---|
| GET | `/api/researches/:humId/versions` | 全 version 配列を返す |
| PUT | `/api/researches/:humId/versions` | 全 version 配列を一括更新 |

### Dataset

| Method | Path | 説明 |
|---|---|---|
| GET | `/api/datasets` | 全 datasetId のユニーク一覧。レスポンス: `{ datasetIds: string[] }` |
| POST | `/api/datasets` | dataset 新規作成 (datasetId はユーザーが指定、humId を紐づけ) |
| GET | `/api/datasets/:datasetKey` | dataset 詳細 (experiments 含む)。datasetKey = `{datasetId}-{version}` |
| PUT | `/api/datasets/:datasetKey` | dataset 更新 (experiments 含む) |
| DELETE | `/api/datasets/:datasetKey` | dataset 削除 (JSON ファイル + ResearchVersion の参照 + editor-state を削除) |

### Curation Status

| Method | Path | 説明 |
|---|---|---|
| GET | `/api/curation-status/research/:humId` | セクション別 curation 状態を取得 |
| PUT | `/api/curation-status/research/:humId` | セクション状態を部分更新 (merge) |

GET レスポンス:

```json
{
  "status": "in-progress",
  "sectionStatuses": {
    "title": "curated",
    "summary": "uncurated",
    "dataProvider": "uncurated",
    "grant": "uncurated",
    "publication": "uncurated",
    "controlledAccessUser": "uncurated",
    "dataset:JGAD000001-v1": "uncurated"
  }
}
```

PUT リクエスト (部分更新):

```json
{ "sectionStatuses": { "title": "curated" } }
```

セクション ID は `RESEARCH_SECTION_IDS` (title, summary, dataProvider, grant, publication, controlledAccessUser) と動的な `dataset:{datasetKey}` キーで構成される。

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

## 起動方法

```bash
# structured-json ディレクトリのパスを環境変数で指定
STRUCTURED_JSON_DIR=/path/to/humandbs/apps/backend/crawler-results/structured-json \
npm run dev
```

`npm run dev` で Vite dev server と Express API server を同時に起動する。
