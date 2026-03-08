# 一覧画面 (`/`)

research の一覧を表示する。

## 表示項目

| 表示項目 | 説明 |
|---|---|
| humId | research の識別子 (monospace) |
| title (ja) | 研究タイトル (日本語、truncate + tooltip) |
| datePublished | 公開日 (v1) |
| dateModified | 更新日 (最新 version) |
| dataset 数 | 紐づく dataset の件数 (展開で dataset ID 一覧表示) |
| accessRestrictions | アクセス制限種別 (dataset の criteria から集約) |
| curation status | uncurated / in-progress / curated (Chip 表示) |

## 機能

- curation status でフィルタ (Select)
- humId / title(ja) でテキスト検索 (クライアントサイドフィルタ)
- カラムヘッダーでソート (asc -> desc -> clear の 3 状態)
- デフォルトソート: humId 昇順 (natural sort)
- research の行をクリックして `/research/:humId` に遷移

## レイアウト

defaultLayout (AppHeader + Container + AppFooter) を使用。
