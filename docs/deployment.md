# デプロイ構成

## 概要

humandbs-editor を AWS EC2 にデプロイし、nginx の Basic 認証越しにインターネットからアクセスできるようにする。

## インフラ構成

```
Internet (HTTP:80)
    |
    v
EC2 t3.small (ap-northeast-1)
Amazon Linux 2023, 2GB RAM
    |
    +-- nginx (host)
    |     - Basic 認証
    |     - reverse proxy → localhost:3000
    |
    +-- Docker Compose (既存 compose.yml)
          - humandbs-editor コンテナ (port 3000)
            - Vite dev server (port 3000, SPA + HMR)
            - Express API server (port 3001)
            - Vite が /api/* を port 3001 にプロキシ
```

## AWS リソース

| リソース | 設定 |
|---|---|
| EC2 インスタンス | t3.small, Amazon Linux 2023 |
| リージョン | ap-northeast-1 (東京) |
| ストレージ | gp3 20GB |
| キーペア | humandbs-editor-key (ED25519) |
| セキュリティグループ | humandbs-editor-sg |
| Elastic IP | なし (停止/起動で IP が変わる点は許容) |

### セキュリティグループ (humandbs-editor-sg)

| 方向 | ポート | ソース | 用途 |
|---|---|---|---|
| Inbound | 22 | このサーバーの IP/32 | SSH |
| Inbound | 80 | 0.0.0.0/0 | HTTP (nginx) |
| Outbound | 全て | 0.0.0.0/0 | デフォルト |

## nginx 設定

```nginx
server {
    listen 80;
    server_name _;

    auth_basic "humandbs-editor";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

WebSocket ヘッダー (`Upgrade`, `Connection`) は Vite HMR に必要。

## データ配置

```
/home/ec2-user/humandbs-editor/
├── structured-json/    ← scp で手動配置
├── data/               ← editor-state.json (自動生成)
├── compose.yml
├── Dockerfile
├── .env
└── ...
```

structured-json は EC2 起動後に手動で scp する:

```bash
scp -i ~/.ssh/humandbs-editor-key \
    -r structured-json/ \
    ec2-user@<EC2_PUBLIC_DNS>:~/humandbs-editor/structured-json/
```

## セットアップ手順

1. SSH キーペア作成 (AWS)
2. セキュリティグループ作成
3. EC2 インスタンス起動 (user-data で Docker + nginx をインストール)
4. SSH 接続確認
5. プロジェクトを EC2 に clone/scp
6. nginx の Basic 認証設定
7. docker compose up
8. structured-json を scp
9. 動作確認

## HTTPS 対応 (将来)

必要になったら nginx に自己署名証明書を追加する。セキュリティグループに 443 を開ける。

```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;
    # ... (上記と同じ proxy 設定)
}
```
