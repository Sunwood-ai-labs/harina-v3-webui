# 🚀 インストールガイド

## 前提条件

- Docker & Docker Compose
- Git

## インストール手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/Sunwood-ai-labs/harina-v3-webui.git
cd harina-v3-webui
```

### 2. 環境変数の設定

```bash
cp .env.example .env
```

`.env`ファイルを編集してAPIキーを設定：

```env
# 必須: 使用するAIプロバイダーのAPIキーを設定
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Discordボットを使う場合
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_ALLOWED_CHANNEL_IDS=
DISCORD_CHANNEL_UPLOADERS=
DISCORD_RECEIPT_BASE_URL=https://localhost
```

### 3. アプリケーションの起動

```bash
# Docker Composeでアプリケーション全体を起動
docker-compose up --build
```

### 4. アクセス

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000
- **API ドキュメント**: http://localhost:8000/docs

## 🔧 設定オプション

### ポート設定

デフォルトのポートを変更したい場合は、`docker-compose.yml`を編集してください：

```yaml
ports:
  - "3000:3000"  # フロントエンド
  - "8000:8000"  # バックエンド
  - "5432:5432"  # データベース
```

### データベース設定

データベースの設定を変更したい場合は、`.env`ファイルの`DATABASE_URL`を編集してください。
