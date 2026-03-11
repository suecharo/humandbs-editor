# research 編集画面 (`/research/:humId`)

1 つの research の全情報をセクション分けで表示・編集する。

## レイアウト

画面全体を左右に分割する split layout (中央に divider)。
各ペインは 4 つのタブを持ち、左右で独立して切り替えられる:

| タブ | 内容 |
|---|---|
| Research | Research フォーム編集 |
| Dataset | Dataset 一覧・編集 ([詳細](dataset-edit.md)) |
| Original Ja | humandbs 元ページ 日本語版 (サーバーサイドプロキシ経由) |
| Original En | humandbs 元ページ 英語版 (サーバーサイドプロキシ経由) |

- 左ペインの初期タブ: Research (index 0)
- 右ペインの初期タブ: Original Ja (index 2)
- 全タブは lazy rendering (初回表示まで DOM 未生成)
- Original タブはサーバーサイドプロキシ (`GET /api/researches/:humId/original?lang=ja|en`) で humandbs のページを取得し、header/menu/footer を除去して iframe に表示する
- プロキシ先は `humandbs.dbcls.jp` に限定 (SSRF 対策)
- フォールバックとして「新しいタブで開く」リンクを表示する

ページ上部にパンくずリスト (`研究一覧 > {humId}`) を表示する。

## 基本情報カード

パンくずリストとタブの間に `BasicInfoSection` を `Container` 内に配置する (タブ内には含めない)。
左右ペイン共通の情報であり、タブ切り替えに関係なく常に表示される。

### Lock バナー

BasicInfoSection の最上部に編集状態を示すバナーを表示:

- 編集モード: `Alert` (info) 「あなたが編集中です」
- 閲覧モード: `Alert` (warning) 「{name} さんが編集中のため閲覧のみです」 + 「編集を開始する」ボタン

### ヘッダー行

- 見出し: `{humId}` (`SectionHeader` default size, `component="h1"`)
- `CurationStatusChip`: research 全体の curation 状態を表示 (導出値)
- アクションボタン (右寄せ、左から順に):
  - 「全て Curated」: 全セクションを curated に設定 (確認ダイアログ)
  - 「全て Uncurated」: 全セクションを uncurated に設定 (確認ダイアログ)
  - 「保存」: `dirty` 時のみ有効。確認ダイアログ → Research + Versions + 変更 Datasets を一括保存
  - 「変更を破棄」: `dirty` 時のみ有効。draft を server state にリセットする (確認ダイアログ)

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
| Release Note | テキスト要約 (truncate 60 文字) |
| Datasets | 件数 (center-aligned) |

行クリックで `Collapse` を展開し、以下を編集・表示:

- Release Date: TextField (editable)
- Release Note (JA): TextField (multiline, editable)
- Release Note (EN): TextField (multiline, editable)
- Datasets: `Chip` でデータセット ID とバージョンを一覧表示 (read-only)

変更されたフィールドには modified 背景色を適用する。

## Research タブのセクション一覧

各セクションの `SectionHeader` には `SectionCurationToggle` を `action` として配置する。
トグルクリックでそのセクションの curation 状態を切り替える (`uncurated` <-> `curated`)。

| セクション | コンポーネント | セクションID | 内容 |
|---|---|---|---|
| タイトル | `TitleSection` | `title` | title (ja/en) |
| サマリー | `SummarySection` | `summary` | aims, methods, targets |
| データ提供者 + 研究プロジェクト | `DataProviderSection` | `dataProvider` | Person 配列 + ResearchProject 配列、カード+ダイアログ編集、ORCID 検索 |
| 助成金 | `GrantSection` | `grant` | Grant 配列、カード+ダイアログ編集 |
| 関連論文 | `PublicationSection` | `publication` | Publication 配列、カード+ダイアログ編集 (datasetIds は read-only) |
| データ利用者 | `ControlledAccessUserSection` | `controlledAccessUser` | Person 配列、カード+ダイアログ編集、ORCID 検索 (datasetIds は read-only) |

### 配列セクションの編集パターン

データ提供者・研究プロジェクト・助成金・関連論文・データ利用者の各セクションは `ItemCardList` パターンを採用する:

- **カードリスト**: 各アイテムをコンパクトなカード (Paper) でサマリー表示
- **ダイアログ編集**: Edit ボタンで Dialog を開き、全フィールドを編集
- **追加**: Add ボタンで新規アイテム用の Dialog を開く
- **削除**: Delete ボタンで確認ダイアログを表示後に削除
- **並べ替え**: Move Up / Move Down ボタンで順序変更

### ORCID 検索

データ提供者・データ利用者の編集ダイアログに ORCID 検索 (`OrcidAutocomplete`) を配置する:

- ORCID public API (`pub.orcid.org/v3.0/expanded-search`) でデバウンス検索 (300ms)
- 選択時に `name.en.text` に英語名、`organization.name.en.text` に所属機関名、`orcid` に ORCID ID を自動入力
- 日本語名 (`name.ja`) は手動入力のまま

## Curation 状態管理

### セクションレベル

各セクションは `"uncurated"` または `"curated"` の 2 値で管理する。
`SectionCurationToggle` (ToggleButtonGroup: Uncurated | Curated の2択) をクリックしてトグルする。

Dataset は `dataset:{datasetKey}` の動的キーでセクション扱いされる。

### Research レベル (導出)

research 全体の curation 状態はセクション状態から自動導出する:

- 全セクション `curated` → research は `"curated"`
- 全セクション `uncurated` → research は `"uncurated"`
- 混在 → research は `"in-progress"`

## Editing Lock

設計書の [editing lock](../design.md#editing-lock-悲観的ロック) を参照。

- 編集画面を開く → lock 取得を試みる
- 成功 → 編集モード (`viewMode: "editing"`)
- 409 (他ユーザー lock 中) → `LockConflictDialog` を表示
  - 「戻る」: 一覧画面に遷移
  - 「閲覧のみで開く」: readOnly モード
  - 「強制的に編集する」: `force: true` で lock 奪取
- 閲覧モード中は BasicInfoSection のバナーに「編集を開始する」ボタンが表示される
