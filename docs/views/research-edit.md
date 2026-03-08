# research 編集画面 (`/research/:humId`)

1 つの research の全情報をセクション分けで表示・編集する。

## レイアウト

fullScreenLayout (AppHeader + full-height main、footer なし) を使用。

画面全体を左右に分割する split layout (中央に divider)。
各ペインは 3 つのタブを持ち、左右で独立して切り替えられる:

| タブ | 内容 |
|---|---|
| Edit | フォーム編集 |
| Preview | プレビュー表示 |
| Original Ja | humandbs 元ページ 日本語版 (サーバーサイドプロキシ経由) |
| Original En | humandbs 元ページ 英語版 (サーバーサイドプロキシ経由) |

- タブの初期値は Edit (index 0)
- Preview / Original タブは lazy rendering (初回表示まで DOM 未生成)
- Original Ja / Original En タブはサーバーサイドプロキシ (`GET /api/researches/:humId/original?lang=ja|en`) で humandbs のページを取得し、header/menu/footer を除去して iframe に表示する
- プロキシ先は `humandbs.dbcls.jp` に限定 (SSRF 対策)
- フォールバックとして「新しいタブで開く」リンクを表示する
- フォームの変更はプレビューにリアルタイム反映される (Jotai atom 共有)

## 基本情報カード

パンくずリストとタブの間に `BasicInfoSection` を `Container` (`maxWidth="lg"`) 内に配置する (タブ内には含めない)。
左右ペイン共通の情報であり、タブ切り替えに関係なく常に表示される。

### ヘッダー行

- 見出し: `{humId}` (`SectionHeader` default size, `component="h1"`)
- `CurationStatusChip`: research 全体の curation 状態を表示 (導出値、後述)
- アクションボタン (右寄せ):
  - 「変更を破棄」: `dirty` 時のみ有効。draft を server state にリセットする
  - 「全て Uncurated」: 全セクションを uncurated に設定
  - 「全て Curated」: 全セクションを curated に設定

### メタデータ

2 列グリッドで表示:

- URL (JA): MUI Link (`target="_blank"`) で別タブ表示
- URL (EN): 同上
- Published: datePublished (read-only)
- Modified: dateModified (read-only)

### Releases テーブル

`SectionHeader` (small) で「Releases」と表示。

| 列 | 内容 |
|---|---|
| (expand icon) | 行クリックで展開/折りたたみ |
| Version | monospace |
| Release Date | |
| Datasets | 件数 (right-aligned) |

行クリックで `Collapse` を展開し、以下を表示:

- Release Note (JA/EN): `releaseNote.ja.text` / `releaseNote.en.text`
- Datasets: `Chip` でデータセット ID とバージョンを一覧表示

## セクション一覧

セクションの順序は humandbs の元ページ (`humandbs.dbcls.jp`) に合わせる。

各セクションの `SectionHeader` には `SectionCurationToggle` を `action` として配置する。
トグルクリックでそのセクションの curation 状態を切り替える (`uncurated` <-> `curated`)。

| セクション | コンポーネント | セクションID | 内容 | 編集可否 |
|---|---|---|---|---|
| タイトル | `TitleSection` | `title` | title (ja/en) | editable |
| サマリー | `SummarySection` | `summary` | aims, methods, targets | editable |
| データセット一覧 | `DatasetsSection` | `datasets` | dataset 一覧 | read-only |
| データ提供者 | `DataProviderSection` | `dataProvider` | Person 配列 | editable, 行追加/削除 |
| 研究プロジェクト | `ResearchProjectSection` | `researchProject` | ResearchProject 配列 | editable, 行追加/削除 |
| 助成金 | `GrantSection` | `grant` | Grant 配列 | editable, 行追加/削除 |
| 関連論文 | `PublicationSection` | `publication` | Publication 配列 (datasetIds は read-only) | editable, 行追加/削除 |
| データ利用者 | `ControlledAccessUserSection` | `controlledAccessUser` | Person 配列 (datasetIds は read-only) | editable, 行追加/削除 |

## Curation 状態管理

### セクションレベル

各セクションは `"uncurated"` または `"curated"` の 2 値で管理する。
`SectionCurationToggle` (Chip) をクリックしてトグルする。

### Research レベル (導出)

research 全体の curation 状態はセクション状態から自動導出する:

- 全セクション `curated` → research は `"curated"`
- 全セクション `uncurated` → research は `"uncurated"`
- 混在 → research は `"in-progress"`

### API

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
    "datasets": "uncurated",
    "dataProvider": "uncurated",
    "researchProject": "uncurated",
    "grant": "uncurated",
    "publication": "uncurated",
    "controlledAccessUser": "uncurated"
  }
}
```

PUT リクエスト (部分更新):

```json
{ "sectionStatuses": { "title": "curated" } }
```

### editor-state.json

`ResearchState` に `sectionStatuses` フィールドを追加 (optional、後方互換):

```typescript
{
  status: CurationStatus          // derived
  sectionStatuses?: Record<string, SectionCurationStatus>
  updatedAt: string
  editingBy: string | null
  editingByName: string | null
  editingAt: string | null
}
```

未登録のセクションは `"uncurated"` として扱う。

### クライアント

- `useCurationStatus(humId)`: TanStack Query で curation 状態を取得
- `useUpdateSectionStatus(humId)`: mutation で状態更新。`onSuccess` でクエリキャッシュを直接更新

## 状態管理

Jotai の server/draft/dirty atom パターンを使用:

- `researchServerAtom`: サーバーから取得した元データ
- `researchDraftAtom`: 編集中のコピー (フォームで変更される)
- `researchDirtyAtom`: server と draft が異なるか (derived atom、`fast-deep-equal` で比較)

フォームは `researchDraftAtom` を直接 `useAtom` で読み書きする。

## スコープ

この段階では以下のみ実装:

- read-only 表示
- フォーム編集 (クライアント state のみ)
- セクション別 curation 状態管理

以下は後続タスク:

- API への PUT (保存)
- editing lock
- diff 確認画面
