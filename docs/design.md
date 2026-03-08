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
        +---OIDC---------------------------------+-------> Keycloak
```

Vite dev server が SPA を配信し、`/api/*` を Express API server にプロキシする。本番でも同じ構成で動かす (ビルド不要)。中央サーバー型で、複数ユーザーがブラウザからアクセスする。

### コンポーネント

| コンポーネント | 役割 |
|---|---|
| Vite dev server | SPA 配信 + `/api/*` プロキシ |
| Express API server | structured-json の読み書き、curation 状態管理 |
| Keycloak | OIDC 認証。humandbs と同じインスタンスを共用 |
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
| 認証 | Keycloak (OIDC), react-oidc-context |
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

### 認証

humandbs と同じ Keycloak インスタンスを OIDC で利用する。

- SPA: `react-oidc-context` で OIDC Authorization Code Flow + PKCE
- API server: Bearer token (JWT) を検証。Keycloak の公開鍵で署名確認
- ユーザー識別: JWT の `sub` claim を editing lock の `editingBy` に使用

### editing lock

同じ research/dataset を複数ユーザーが同時に編集することを防ぐ。

- 編集画面を開くときに lock を取得 (`editingBy`, `editingAt` をセット)
- 保存または画面離脱時に lock を解放
- タイムアウト (30 分) を超えた lock は期限切れとして無視
- 他のユーザーが lock 中の entry を開こうとした場合、「{editingByName} が編集中」と警告を表示し、強制的に開く (lock 奪取) ことも可能

## 画面構成

| 画面 | パス | 仕様書 |
|---|---|---|
| 一覧画面 | `/` | [research-list](views/research-list.md) |
| research 編集画面 | `/research/:humId` | [research-edit](views/research-edit.md) |
| dataset 編集画面 | `/dataset/:datasetId` | dataset-edit (未作成) |

### 編集ワークフロー

編集はクライアント側で保持し、明示的な確定操作まで API server に write しない。

```
open       edit        review      confirm
 |          |           |           |
 v          v           v           v
load  ->  in-memory  -> diff  ->  PUT /api/...
(GET)     (React state) view      (write to FS)
                         |
                     [undo] -> revert to loaded state
```

1. **編集画面を開く**: `GET` で現在のデータを取得
2. **編集**: フォームの変更はクライアントの React state にのみ保持。API server への書き込みは発生しない
3. **diff 確認**: 保存ボタン押下時にフィールドごとの変更差分 (before/after) を表示
4. **確定**: diff 確認画面で「確定」を押すと `PUT` で API server に送信し、structured-json に書き込む
5. **undo**: 編集中いつでも、読み込み時の状態に戻せる。未保存の変更をすべて破棄する

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
| GET | `/api/datasets` | dataset 一覧 |
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
| POST | `/api/lock/research/:humId` | research の lock 取得 |
| DELETE | `/api/lock/research/:humId` | research の lock 解放 |
| POST | `/api/lock/dataset/:datasetId` | dataset の lock 取得 |
| DELETE | `/api/lock/dataset/:datasetId` | dataset の lock 解放 |

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
