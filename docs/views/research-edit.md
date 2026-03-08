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
| Original | humandbs 元ページ (サーバーサイドプロキシ経由) |

- タブの初期値は Edit (index 0)
- Preview / Original タブは lazy rendering (初回表示まで DOM 未生成)
- Original タブはサーバーサイドプロキシ (`GET /api/researches/:humId/original`) で humandbs のページを取得し、header/menu/footer を除去して iframe に表示する
- プロキシ先は `humandbs.dbcls.jp` に限定 (SSRF 対策)
- フォールバックとして「新しいタブで開く」リンクを表示する
- フォームの変更はプレビューにリアルタイム反映される (Jotai atom 共有)

## 基本情報カード

パンくずリストとタブの間に `BasicInfoSection` を `Container` (`maxWidth="lg"`) 内に配置する (タブ内には含めない)。
左右ペイン共通の情報であり、タブ切り替えに関係なく常に表示される。

- 見出し: `{humId} 編集` (`SectionHeader` default size, `component="h1"`)
- URL (ja/en), datePublished, dateModified を read-only で表示
- バージョン履歴テーブル (version, releaseDate, datasets 数)

## セクション一覧

セクションの順序は humandbs の元ページ (`humandbs.dbcls.jp`) に合わせる。

| セクション | コンポーネント | 内容 | 編集可否 |
|---|---|---|---|
| タイトル | `TitleSection` | title (ja/en) | editable |
| サマリー | `SummarySection` | aims, methods, targets | editable |
| フッター | `FootersSection` | footers ja/en (TextValue 配列) | editable, 行追加/削除 |
| データセット一覧 | `DatasetsSection` | dataset 一覧 | read-only |
| データ提供者 | `DataProviderSection` | Person 配列 | editable, 行追加/削除 |
| 研究プロジェクト | `ResearchProjectSection` | ResearchProject 配列 | editable, 行追加/削除 |
| 助成金 | `GrantSection` | Grant 配列 | editable, 行追加/削除 |
| 関連論文 | `PublicationSection` | Publication 配列 (datasetIds は read-only) | editable, 行追加/削除 |
| データ利用者 | `ControlledAccessUserSection` | Person 配列 (datasetIds は read-only) | editable, 行追加/削除 |

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

以下は後続タスク:

- API への PUT (保存)
- editing lock
- diff 確認画面
- curation status 変更
