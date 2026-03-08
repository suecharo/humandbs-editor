# 一覧画面 (`/`)

research の一覧を表示する。

## 表示項目

| 表示項目 | 説明 |
|---|---|
| humId | research の識別子 |
| title (ja/en) | 研究タイトル |
| dataset 数 | 紐づく dataset の件数 |
| curation status | uncurated / in-progress / curated |

## 機能

- curation status でフィルタ
- humId / title でテキスト検索 (クライアントサイドフィルタ)
- research をクリックして `/research/:humId` に遷移

## レイアウト

defaultLayout (AppHeader + Container + AppFooter) を使用。
