# 一覧画面 (`/`)

research の一覧を表示する。

## 表示項目

| 列 | 説明 |
|---|---|
| Research ID | humId (monospace、natural sort) |
| 研究題目 | title.ja (truncate + tooltip) |
| Date Published | 公開日 + version 番号 (例: `2024-01-01 (v1)`) |
| Date Modified | 更新日 + 最新 version 番号 |
| Datasets | 紐づく dataset の件数 (展開で dataset ID 一覧表示) |
| アクセス制限 | アクセス制限種別 (dataset の criteria から集約、日本語ラベル) |
| Status | curation status (Chip 表示: uncurated / in-progress / curated) |
| 編集中 | lock 状態 (LockIcon + ユーザー名、30 分タイムアウトで消える) |
| Actions | 編集ボタン (EditOutlinedIcon) |

## 機能

- curation status でフィルタ (Select: All / Uncurated / In Progress / Curated)
- humId / title(ja) でテキスト検索 (クライアントサイドフィルタ)
- カラムヘッダーでソート (asc -> desc -> clear の 3 状態)
- デフォルトソート: humId 昇順 (natural sort)
- research の行クリックで `/research/:humId` に遷移
- フィルタ結果件数を表示 (`N / M results`)

## レイアウト

defaultLayout (AppHeader + Container + AppFooter) を使用。
