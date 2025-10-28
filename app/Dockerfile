FROM node:20-bookworm-slim

WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# アプリケーションファイルをコピー
COPY . .

# 依存関係をインストール
RUN npm ci

# Next.jsをビルド
RUN npm run build

# ポート3000を公開
EXPOSE 3000

# データベース待機とアプリケーション起動
CMD ["sh", "-c", "node wait-for-db.js && npm start"]
