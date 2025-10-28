<p align="center">
  <img src="header.png" alt="HARINA Receipt Recognition Header" width="720">
</p>

<h1 align="center">🧾 Receipt Recognition App with HARINA CLI</h1>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Docker%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Compose">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
</p>

HARINAのCLIをバックエンドにしたDocker-composeベースのレシート認識アプリです。

## 🏗️ アーキテクチャ

- **Backend**: HARINA v3 CLI (FastAPI) - レシート認識API
- **Frontend**: React + TypeScript - ユーザーインターフェース  
- **Database**: PostgreSQL - レシートデータ保存
- **Container**: Docker Compose - 統合環境

## 🚀 クイックスタート

### 🔑 1. 環境変数の設定

```bash
cp .env.example .env
```

`.env`ファイルを編集してAPIキーを設定：

```env
# 必須: 使用するAIプロバイダーのAPIキーを設定
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 🚀 2. アプリケーションの起動

```bash
# Docker Composeでアプリケーション全体を起動
docker-compose up --build
```

### 🌐 3. アクセス

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8001
- **API ドキュメント**: http://localhost:8001/docs
- **データベース管理UI**: http://localhost:3001

## 📱 機能

### 💻 フロントエンド (React + TypeScript)
- ドラッグ&ドロップでレシート画像アップロード
- リアルタイム処理進捗表示
- AIモデル選択（Gemini、GPT-4o、Claude）
- レシート詳細表示（店舗情報、商品一覧、合計金額）
- レシート履歴一覧（データベース連携）
- リアルタイム統計情報表示
- レスポンシブデザイン

### 🧠 バックエンド (HARINA CLI)
- 複数AIモデル対応
- XML/CSV形式出力
- RESTful API
- 高速画像処理

### 🗄️ データベース (PostgreSQL)
- レシート情報永続化
- 商品情報管理
- 履歴機能

## 🛠️ 開発

### 🔄 個別サービスの起動

```bash
# バックエンドのみ
docker-compose up backend postgres

# フロントエンドのみ（開発モード）
cd frontend
npm install
npm start
```

### 📋 ログの確認

```bash
# 全サービスのログ
docker-compose logs -f

# 特定サービスのログ
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

## 📁 プロジェクト構造

```
├── docker-compose.yml          # Docker Compose設定
├── .env.example               # 環境変数テンプレート
├── backend/
│   └── Dockerfile            # HARINAベースのバックエンド
├── frontend/                 # React + TypeScript フロントエンド
│   ├── src/
│   │   ├── components/       # Reactコンポーネント
│   │   ├── services/         # API通信
│   │   ├── types/           # TypeScript型定義
│   │   └── App.tsx          # メインアプリ
│   ├── package.json
│   └── Dockerfile
└── database/
    └── init.sql             # データベース初期化
```

## 🔧 カスタマイズ

### 🧩 AIモデルの追加

`frontend/src/components/ReceiptUpload.tsx`でモデル選択肢を編集：

```typescript
<option value="new-model">New Model</option>
```

### 🎨 UIのカスタマイズ

Tailwind CSSを使用しているため、`frontend/src/`内のコンポーネントで簡単にスタイル変更可能。

## 🐛 トラブルシューティング

### ❗ よくある問題

1. **APIキーエラー**
   - `.env`ファイルでAPIキーが正しく設定されているか確認

2. **Docker起動エラー**
   - ポート3000, 8000, 5432が使用されていないか確認
   - `docker-compose down`で既存コンテナを停止

3. **画像アップロードエラー**
   - 対応形式: JPEG, PNG, GIF, BMP
   - ファイルサイズ制限を確認

### 🧐 ログ確認

```bash
# エラーログの確認
docker-compose logs backend | grep ERROR
docker-compose logs frontend | grep ERROR
```

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成
3. 変更をコミット
4. プルリクエストを作成

## 📞 サポート

問題や質問がある場合は、GitHubのIssuesで報告してください。
