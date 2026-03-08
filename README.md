# humandbs-editor

[humandbs](https://github.com/dbcls/humandbs) の structured-json データを管理する Web ベースのツール。

curation 作業を起点に、humandbs のデータ管理ワークフロー全般を支援する。

## セットアップ

### structured-json の準備

humandbs リポジトリから structured-json をコピーする:

```bash
cp -r /path/to/humandbs/apps/backend/crawler-results/structured-json ./structured-json
```

### 環境変数

```bash
cp env.example .env
```

## 起動方法

### ローカル

```bash
npm install
npm run dev
```

`http://localhost:5173` でアクセスできる。

### Docker

```bash
docker compose up --build
```

### Podman

```bash
cp compose.override.podman.yml compose.override.yml
podman-compose up --build
```

## 開発コマンド

| コマンド | 内容 |
|---|---|
| `npm run dev` | API サーバー + Vite dev サーバーを同時起動 |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript 型チェック |
| `npm test` | vitest でテスト実行 |
| `npm run test:watch` | vitest をウォッチモードで実行 |
| `npm run test:mutation` | Stryker で mutation testing |

## ドキュメント

- [設計書](docs/design.md)
