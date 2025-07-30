<div align="center">

# Receipt Recognition App with HARINA CLI

<img src="header.png" alt="Receipt Recognition App" width="100%"/>

<p>
  <img src="https://img.shields.io/badge/React-18.0-blue?logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Next.js-14.0-black?logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Docker-Compose-blue?logo=docker" alt="Docker"/>
  <img src="https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/FastAPI-Latest-green?logo=fastapi" alt="FastAPI"/>
</p>

</div>

HARINAのCLIをバックエンドにしたDocker-composeベースのレシート認識アプリです。

## 📋 目次

- [🏗️ アーキテクチャ](#️-アーキテクチャ)
- [🚀 クイックスタート](#-クイックスタート)
- [📱 機能](#-機能)
- [📁 プロジェクト構造](#-プロジェクト構造)
- [📚 詳細ドキュメント](#-詳細ドキュメント)

## 🏗️ アーキテクチャ

- **Backend**: HARINA v3 CLI (FastAPI) - レシート認識API
- **Frontend**: React + TypeScript - ユーザーインターフェース  
- **Database**: PostgreSQL - レシートデータ保存
- **Container**: Docker Compose - 統合環境

## 🚀 クイックスタート

```bash
# 1. リポジトリのクローン
git clone https://github.com/Sunwood-ai-labs/harina-v3-webui.git
cd harina-v3-webui

# 2. 環境変数の設定
cp .env.example .env
# .envファイルを編集してAPIキーを設定

# 3. アプリケーションの起動
docker-compose up --build
```

### 🌐 アクセス

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000  
- **API ドキュメント**: http://localhost:8000/docs

> 📖 詳細なインストール手順は [インストールガイド](docs/INSTALL.md) をご覧ください。

## 📱 機能

### フロントエンド (React + TypeScript)
- ドラッグ&ドロップでレシート画像アップロード
- リアルタイム処理進捗表示
- AIモデル選択（Gemini、GPT-4o、Claude）
- レシート詳細表示（店舗情報、商品一覧、合計金額）
- レシート履歴一覧
- レスポンシブデザイン

### バックエンド (HARINA CLI)
- 複数AIモデル対応
- XML/CSV形式出力
- RESTful API
- 高速画像処理

### データベース (PostgreSQL)
- レシート情報永続化
- 商品情報管理
- 履歴機能



## 📁 プロジェクト構造

```
├── docker-compose.yml          # Docker Compose設定
├── .env.example               # 環境変数テンプレート
├── app/                      # Next.js アプリケーション
│   ├── app/
│   │   ├── components/       # Reactコンポーネント
│   │   ├── api/             # API Routes
│   │   └── page.tsx         # メインページ
│   ├── package.json
│   └── Dockerfile
├── harina/                   # HARINA CLI サーバー
│   ├── Dockerfile
│   └── client_sample.py     # クライアントサンプル
├── database/
│   ├── init.sql             # データベース初期化
│   └── migration_add_uploader.sql
├── docs/                     # ドキュメント
│   ├── INSTALL.md           # インストールガイド
│   ├── DEVELOPMENT.md       # 開発ガイド
│   └── TROUBLESHOOTING.md   # トラブルシューティング
└── example/                  # 使用例
    └── README.md            # サンプルコード
```

## � カ詳細ドキュメント

| ドキュメント | 説明 |
|-------------|------|
| [📖 インストールガイド](docs/INSTALL.md) | 詳細なセットアップ手順 |
| [🛠️ 開発ガイド](docs/DEVELOPMENT.md) | 開発環境の構築とカスタマイズ |
| [🐛 トラブルシューティング](docs/TROUBLESHOOTING.md) | よくある問題と解決方法 |
| [📚 使用例](example/README.md) | サンプルコードと使用方法 |

## 🖼️ スクリーンショット

<div align="center">
  <img src="docs/images/app-screenshot.png" alt="アプリケーション画面" width="800"/>
  <p><em>レシート認識アプリのメイン画面</em></p>
</div>

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルをご覧ください。

## 🤝 コントリビューション

コントリビューションを歓迎します！詳細は [開発ガイド](docs/DEVELOPMENT.md) をご覧ください。

## 📞 サポート

- 🐛 バグ報告: [GitHub Issues](https://github.com/Sunwood-ai-labs/harina-v3-webui/issues)
- � 機能ポ要望: [GitHub Discussions](https://github.com/Sunwood-ai-labs/harina-v3-webui/discussions)
- 📖 ドキュメント: [Wiki](https://github.com/Sunwood-ai-labs/harina-v3-webui/wiki)

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/Sunwood-ai-labs">Sunwood AI Labs</a></p>
</div>