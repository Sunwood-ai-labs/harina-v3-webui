
以下の情報を元に、リリースノートの要件に従ってSourceSageの新バージョンv0.2.0の日本語のリリースノートを生成してください。

# リリースノートの要件:
<Release notes requirements>

1. 各項目に関連するコミットハッシュがある場合は、(commit: abc1234のように)括弧内に記載してください。ハッシュは最初の7文字のみ使用してください。
2. 重要な変更や注意が必要な点があれば、別セクションで強調してください。
3. アップグレード手順や互換性に関する注意事項があれば記載してください。
4. 貢献者への謝辞を含めてください（もし情報があれば）。
5. 各セクションに適切な絵文字を使用して、視覚的に分かりやすくしてください。
6. 完成されたマークダウン形式のリリースノートを作成してください。
7. 各項目の末尾に、その情報の確信度を 🟢（高）、🟡（中）、🔴（低）で示してください。
8. 提供された情報のみを使用し、推測や一般化された情報の追加は避けてください。
9. 情報が不足している場合は、その旨を明記し、該当するセクションを省略してください。
9. 既に機能が実装されておりアップデートのような項目は、「🔄」と明記してください。
10. ステップバイステップで正確に処理してください
11. ハルシネーションが起きないようにしてください
12. 特に情報が無いセクションは記載しないで省略して。

</Release notes requirements>

# 絵文字の使用ガイドライン:
<Emoji usage guidelines>
- 新機能: 🎉 (パーティーポッパー)
- 改善点: 🚀 (ロケット)
- バグ修正: 🐛 (バグ)
- 重要な変更: ⚠️ (警告)
- セキュリティ関連: 🔒 (鍵)
- パフォーマンス改善: ⚡ (稲妻)
- ドキュメント: 📚 (本)
- 非推奨: 🗑️ (ゴミ箱)
- 削除された機能: 🔥 (炎)
- 確信度（高）: 🟢
- 確信度（中）: 🟡
- 確信度（低）: 🔴
- 継続中の項目: 🔄
</Emoji usage guidelines>

# リリースノートのフォーマット:
<Release notes format>
# 🚀 SourceSage vv0.2.0 リリースノート

## 📋 概要
[全体的な変更の要約と主要なハイライトを1-2文で]

## ✨ 新機能
- 🎉 [新機能の説明] (commit: xxxxxxx) 🟢🟡🔴 🔄
    - [詳細な説明]

## 🛠 改善点
- 🚀 [改善点の説明] (commit: xxxxxxx) 🟢🟡🔴 🔄
    - [詳細な説明]
    
## 🐛 バグ修正
- 🐛 [修正されたバグの説明] (commit: xxxxxxx) 🟢🟡🔴 🔄
    - [詳細な説明]

## ⚠️ 重要な変更
- ⚠️ [重要な変更点や注意が必要な点] 🟢🟡🔴 🔄
    - [詳細な説明]
    
## 📦 アップグレード手順
[必要に応じてアップグレード手順や注意事項を記載]

## 👏 謝辞
[貢献者への謝辞]
</Release notes format>

# 入力情報:
<Input information>

## 今回のリリースの変更履歴
<change history>

</change history>

## [参考資料] リポジトリの全体情報
下記にはリポジトリの構造とリポジトリ内の主要なファイルの一覧を記載します。
リリースノートを作成時の事前知識として参考に使用して

<Repository information>
    # Project: harina-v3-webui

```plaintext
OS: nt
Directory: C:\Prj\harina-v3-webui

├── app/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health/
│   │   │   │   └── route.ts
│   │   │   └── process-receipt/
│   │   │       └── route.ts
│   │   ├── components/
│   │   │   ├── CameraCapture.tsx
│   │   │   ├── PhotoGallery.tsx
│   │   │   ├── ReceiptDisplay.tsx
│   │   │   ├── ReceiptUpload.tsx
│   │   │   └── UsageDashboard.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── types.ts
│   ├── Dockerfile
│   ├── next-env.d.ts
│   ├── next.config.js
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── database/
│   └── init.sql
├── harina/
│   └── Dockerfile
├── .env.example
├── .SourceSageignore
├── docker-compose.yml
└── README.md
```

## 📂 Gitリポジトリ情報

### 🌐 基本情報

- 🔗 リモートURL: https://github.com/Sunwood-ai-labs/harina-v3-webui.git
- 🌿 デフォルトブランチ: main
- 🎯 現在のブランチ: main
- 📅 作成日時: 2025-07-29 20:29:29
- 📈 総コミット数: 12

### 🔄 最新のコミット

- 📝 メッセージ: Merge branch 'develop'
- 🔍 ハッシュ: ad98a07b
- 👤 作者: Maki (sunwood.ai.labs@gmail.com)
- ⏰ 日時: 2025-07-29 20:23:04

### 👥 主要コントリビューター

| 👤 名前 | 📊 コミット数 |
|---------|-------------|
| Maki | 12 |

## 📊 プロジェクト統計

- 📅 作成日時: 2025-07-29 20:52:07
- 📁 総ディレクトリ数: 8
- 📄 総ファイル数: 24
- 📏 最大深度: 4
- 📦 最大ディレクトリ:  (32 エントリ)

### 📊 ファイルサイズと行数

| ファイル | サイズ | 行数 | 言語 |
|----------|--------|------|------|
| app\app\page.tsx | 11.9 KB | 325 | plaintext |
| app\app\components\UsageDashboard.tsx | 11.4 KB | 285 | plaintext |
| app\app\components\ReceiptDisplay.tsx | 8.9 KB | 206 | plaintext |
| app\app\components\PhotoGallery.tsx | 8.4 KB | 199 | plaintext |
| app\app\components\ReceiptUpload.tsx | 7.6 KB | 207 | plaintext |
| app\app\components\CameraCapture.tsx | 6.1 KB | 183 | plaintext |
| README.md | 4.2 KB | 158 | markdown |
| app\tailwind.config.ts | 3.2 KB | 124 | typescript |
| app\app\globals.css | 3.0 KB | 81 | css |
| database\init.sql | 2.5 KB | 73 | sql |
| docker-compose.yml | 2.2 KB | 83 | yaml |
| app\app\api\process-receipt\route.ts | 2.0 KB | 60 | typescript |
| app\app\layout.tsx | 1.4 KB | 48 | plaintext |
| app\package.json | 885.0 B | 37 | json |
| app\app\api\health\route.ts | 820.0 B | 34 | typescript |
| .SourceSageignore | 787.0 B | 58 | plaintext |
| app\tsconfig.json | 617.0 B | 27 | json |
| app\app\types.ts | 532.0 B | 25 | typescript |
| harina\Dockerfile | 455.0 B | 15 | dockerfile |
| .env.example | 403.0 B | 14 | plaintext |
| app\Dockerfile | 374.0 B | 21 | dockerfile |
| app\next-env.d.ts | 206.0 B | 5 | typescript |
| app\next.config.js | 167.0 B | 8 | javascript |
| app\postcss.config.js | 86.0 B | 6 | javascript |
| **合計** |  | **2282** |  |

### 📈 言語別統計

| 言語 | ファイル数 | 総行数 | 合計サイズ |
|------|------------|--------|------------|
| plaintext | 9 | 1525 | 56.8 KB |
| typescript | 5 | 248 | 6.7 KB |
| markdown | 1 | 158 | 4.2 KB |
| yaml | 1 | 83 | 2.2 KB |
| css | 1 | 81 | 3.0 KB |
| sql | 1 | 73 | 2.5 KB |
| json | 2 | 64 | 1.5 KB |
| dockerfile | 2 | 36 | 829.0 B |
| javascript | 2 | 14 | 253.0 B |

`.SourceSageignore`

**サイズ**: 787.0 B | **行数**: 58 行
```plaintext
# バージョン管理システム関連
.git/
.gitignore

# キャッシュファイル
__pycache__/
.pytest_cache/
**/__pycache__/**
*.pyc

# ビルド・配布関連
build/
dist/
*.egg-info/

# 一時ファイル・出力
output/
output.md
test_output/
.SourceSageAssets/
.SourceSageAssetsDemo/

# アセット
*.png
*.svg
*.jpg
*.jepg
assets/

# その他
LICENSE
example/
package-lock.json
.DS_Store

# 特定のディレクトリを除外
tests/temp/
docs/drafts/

# パターンの例外（除外対象から除外）
!docs/important.md
!.github/workflows/
repository_summary.md

# Terraform関連
.terraform
*.terraform.lock.hcl
*.backup
*.tfstate

# Python仮想環境
venv
.venv

.next/

node_modules/
app/node_modules/
```

`.env.example`

**サイズ**: 403.0 B | **行数**: 14 行
```plaintext
# API Keys for AI providers
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Database Configuration
DATABASE_URL=postgresql://receipt_user:receipt_password@postgres:5432/receipt_db

# Backend Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8000
```

`README.md`

**サイズ**: 4.2 KB | **行数**: 158 行
```markdown
# Receipt Recognition App with HARINA CLI

HARINAのCLIをバックエンドにしたDocker-composeベースのレシート認識アプリです。

## 🏗️ アーキテクチャ

- **Backend**: HARINA v3 CLI (FastAPI) - レシート認識API
- **Frontend**: React + TypeScript - ユーザーインターフェース  
- **Database**: PostgreSQL - レシートデータ保存
- **Container**: Docker Compose - 統合環境

## 🚀 クイックスタート

### 1. 環境変数の設定

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

### 2. アプリケーションの起動

```bash
# Docker Composeでアプリケーション全体を起動
docker-compose up --build
```

### 3. アクセス

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000
- **API ドキュメント**: http://localhost:8000/docs

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

## 🛠️ 開発

### 個別サービスの起動

```bash
# バックエンドのみ
docker-compose up backend postgres

# フロントエンドのみ（開発モード）
cd frontend
npm install
npm start
```

### ログの確認

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

### AIモデルの追加

`frontend/src/components/ReceiptUpload.tsx`でモデル選択肢を編集：

```typescript
<option value="new-model">New Model</option>
```

### UIのカスタマイズ

Tailwind CSSを使用しているため、`frontend/src/`内のコンポーネントで簡単にスタイル変更可能。

## 🐛 トラブルシューティング

### よくある問題

1. **APIキーエラー**
   - `.env`ファイルでAPIキーが正しく設定されているか確認

2. **Docker起動エラー**
   - ポート3000, 8000, 5432が使用されていないか確認
   - `docker-compose down`で既存コンテナを停止

3. **画像アップロードエラー**
   - 対応形式: JPEG, PNG, GIF, BMP
   - ファイルサイズ制限を確認

### ログ確認

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
```

`docker-compose.yml`

**サイズ**: 2.2 KB | **行数**: 83 行
```yaml
services:
  # PostgreSQL Database
  postgres:
    image: postgres:15
    container_name: receipt_postgres
    environment:
      POSTGRES_DB: receipt_db
      POSTGRES_USER: receipt_user
      POSTGRES_PASSWORD: receipt_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5433:5432"
    networks:
      - receipt_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U receipt_user -d receipt_db"]
      interval: 30s
      timeout: 10s
      retries: 3

  # HARINA CLI Server
  harina:
    build:
      context: ./harina
      dockerfile: Dockerfile
    container_name: receipt_harina
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    ports:
      - "8001:8000"
    networks:
      - receipt_network
    restart: unless-stopped

  # Next.js App (Frontend + API)
  app:
    build:
      context: ./app
      dockerfile: Dockerfile
    container_name: receipt_app
    environment:
      - DATABASE_URL=postgresql://receipt_user:receipt_password@postgres:5432/receipt_db
      - HARINA_API_URL=http://harina:8000
      - NEXT_PUBLIC_API_URL=http://localhost:3000
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      harina:
        condition: service_started
    networks:
      - receipt_network
    restart: unless-stopped

  # db-ui アプリケーション
  # db-ui:
  #   image: ghcr.io/n7olkachev/db-ui:1.1
  #   container_name: db-ui-app
  #   environment:
  #     POSTGRES_HOST: postgres
  #     POSTGRES_USER: receipt_user
  #     POSTGRES_PASSWORD: receipt_password
  #     POSTGRES_DB: receipt_db
  #     POSTGRES_PORT: 5432
  #     # Groq API キーが必要な場合は以下のコメントを外して設定してください
  #   ports:
  #     - "${DB_UI_PORT_HOST:-3000}:3001"
  #   depends_on:
  #     postgres:
  #       condition: service_healthy
  #   restart: unless-stopped

volumes:
  postgres_data:

networks:
  receipt_network:
    driver: bridge
```

`app\Dockerfile`

**サイズ**: 374.0 B | **行数**: 21 行
```dockerfile
FROM node:18-alpine

WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# アプリケーションファイルをコピー
COPY . .

# 依存関係をインストール
RUN npm install

# Next.jsをビルド
RUN npm run build

# ポート3000を公開
EXPOSE 3000

# アプリケーションを起動
CMD ["npm", "start"]
```

`app\next-env.d.ts`

**サイズ**: 206.0 B | **行数**: 5 行
```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
```

`app\next.config.js`

**サイズ**: 167.0 B | **行数**: 8 行
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pg']
  },
}

module.exports = nextConfig
```

`app\package.json`

**サイズ**: 885.0 B | **行数**: 37 行
```json
{
  "name": "receipt-recognition-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18",
    "react-dom": "^18",
    "react-dropzone": "^14.2.3",
    "react-toastify": "^9.1.1",
    "lucide-react": "^0.263.1",
    "axios": "^1.6.0",
    "pg": "^8.11.0",
    "xml2js": "^0.6.2",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/pg": "^8.10.0",
    "@types/xml2js": "^0.4.11",
    "@types/multer": "^1.4.7",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "eslint": "^8",
    "eslint-config-next": "14.0.0"
  }
}
```

`app\postcss.config.js`

**サイズ**: 86.0 B | **行数**: 6 行
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

`app\tailwind.config.ts`

**サイズ**: 3.2 KB | **行数**: 124 行
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 和風カラーパレット
        washi: {
          50: '#fefefe',
          100: '#fcfcfc',
          200: '#f8f8f8',
          300: '#f0f0f0',
          400: '#e8e8e8',
          500: '#d8d8d8',
        },
        sumi: {
          50: '#f7f7f7',
          100: '#e8e8e8',
          200: '#d1d1d1',
          300: '#a8a8a8',
          400: '#7a7a7a',
          500: '#5a5a5a',
          600: '#4a4a4a',
          700: '#3a3a3a',
          800: '#2a2a2a',
          900: '#1a1a1a',
        },
        // 日本の伝統色
        sakura: {
          50: '#fef7f7',
          100: '#fdeaea',
          200: '#fbd5d5',
          300: '#f7b2b2',
          400: '#f18a8a',
          500: '#e85d5d',
          600: '#d63c3c',
          700: '#b32d2d',
          800: '#942929',
          900: '#7c2828',
        },
        matcha: {
          50: '#f6f8f4',
          100: '#e9f0e4',
          200: '#d4e2ca',
          300: '#b5cfa3',
          400: '#92b876',
          500: '#739f54',
          600: '#5a7f40',
          700: '#486535',
          800: '#3c522d',
          900: '#344527',
        },
        indigo: {
          50: '#f0f4f8',
          100: '#d9e6f2',
          200: '#b3cde0',
          300: '#6ba3d0',
          400: '#4a90c2',
          500: '#2e7cb8',
          600: '#1e5f8c',
          700: '#1a4971',
          800: '#183d5b',
          900: '#17334d',
        },
        // アクセントカラー
        gold: {
          50: '#fffbf0',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      transitionDuration: {
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
        '700': '700ms',
        '800': '800ms',
        '900': '900ms',
        '1000': '1000ms',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
export default config
```

`app\tsconfig.json`

**サイズ**: 617.0 B | **行数**: 27 行
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`app\app\globals.css`

**サイズ**: 3.0 KB | **行数**: 81 行
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-washi-300;
  }
  
  body {
    @apply bg-gradient-to-br from-washi-50 via-washi-100 to-matcha-50/20 text-sumi-800 antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
    font-family: 'Hiragino Sans', 'Yu Gothic UI', 'Meiryo UI', sans-serif;
  }
}

@layer components {
  /* 和紙のような質感のカード */
  .card {
    @apply bg-washi-50/90 backdrop-blur-sm border border-washi-300/80 rounded-2xl shadow-sm;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.02);
  }
  
  .card-hover {
    @apply transition-all duration-300 hover:shadow-lg hover:border-washi-400/80 hover:bg-washi-50;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* 和風プライマリボタン */
  .btn-primary {
    @apply bg-gradient-to-r from-indigo-600 to-indigo-700 text-washi-50 px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-lg hover:shadow-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-2 focus:ring-offset-washi-50;
    letter-spacing: 0.025em;
  }
  
  /* セカンダリボタン */
  .btn-secondary {
    @apply bg-washi-50/90 backdrop-blur-sm border border-washi-300 text-sumi-700 px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-washi-100 hover:border-washi-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sumi-500/30 focus:ring-offset-2 focus:ring-offset-washi-50;
    letter-spacing: 0.025em;
  }
  
  /* 和風インプットフィールド */
  .input-field {
    @apply bg-washi-50/90 backdrop-blur-sm border border-washi-300 rounded-xl px-4 py-3 text-sumi-800 placeholder-sumi-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 focus:bg-washi-50;
  }
  
  /* アップロードゾーン */
  .upload-zone {
    @apply border-2 border-dashed border-washi-400 rounded-2xl bg-washi-50/60 backdrop-blur-sm transition-all duration-400 hover:border-matcha-400 hover:bg-matcha-50/30;
  }
  
  .upload-zone-active {
    @apply border-matcha-500 bg-matcha-50/60 shadow-xl shadow-matcha-500/10;
  }
  
  /* 和風グラデーション */
  .wa-gradient-primary {
    @apply bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800;
  }
  
  .wa-gradient-accent {
    @apply bg-gradient-to-br from-matcha-500 via-matcha-600 to-matcha-700;
  }
  
  .wa-gradient-warm {
    @apply bg-gradient-to-br from-sakura-400 via-sakura-500 to-sakura-600;
  }
  
  /* テキストグラデーション */
  .wa-text-gradient {
    @apply bg-gradient-to-r from-indigo-600 to-matcha-600 bg-clip-text text-transparent;
  }
  
  /* 和風シャドウ */
  .wa-shadow-soft {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  }
  
  .wa-shadow-medium {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
  }
}
```

`app\app\layout.tsx`

**サイズ**: 1.4 KB | **行数**: 48 行
```plaintext
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Receipt AI - レシート認識アプリ',
  description: '最新のAI技術でレシートを瞬時に認識・データ化。Gemini、GPT-4o、Claudeに対応したモダンなレシート管理アプリ',
  keywords: 'レシート認識, AI, OCR, 家計簿, 経費管理',
  authors: [{ name: 'Receipt AI Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={inter.variable}>
      <body className="font-sans">
        {children}
        <ToastContainer
          position="top-center"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastClassName="backdrop-blur-sm bg-white/90 border border-slate-200 shadow-lg"
          bodyClassName="text-slate-800"
          progressClassName="bg-gradient-to-r from-blue-500 to-indigo-500"
        />
      </body>
    </html>
  )
}
```

`app\app\page.tsx`

**サイズ**: 11.9 KB | **行数**: 325 行
```plaintext
'use client'

import { useState, useEffect } from 'react'
import { Camera, List, Home as HomeIcon, Activity, Sparkles, Upload, Image as ImageIcon, BarChart3, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ReceiptUpload from './components/ReceiptUpload'
import ReceiptDisplay from './components/ReceiptDisplay'
import CameraCapture from './components/CameraCapture'
import PhotoGallery from './components/PhotoGallery'
import UsageDashboard from './components/UsageDashboard'
import { ReceiptData } from './types'

// 和風ナビゲーションコンポーネント
const Navigation = () => {
  const pathname = usePathname()

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'ホーム' },
    { path: '/receipts', icon: List, label: '履歴' },
  ]

  return (
    <nav className="border-0 rounded-none wa-shadow-soft backdrop-blur-md bg-washi-50/95 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <div className="relative p-2 bg-gradient-to-br from-indigo-100 to-matcha-100 rounded-2xl">
              <Camera className="text-indigo-700" size={24} />
              <Sparkles className="absolute -top-1 -right-1 text-matcha-600" size={10} />
            </div>
            <div>
              <span className="text-2xl font-bold wa-text-gradient tracking-wide">
                レシート和
              </span>
              <p className="text-xs text-sumi-500 -mt-1">Receipt Wa</p>
            </div>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isActive
                      ? 'wa-gradient-primary text-washi-50 wa-shadow-medium'
                      : 'text-sumi-600 hover:text-sumi-800 hover:bg-washi-100/80'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm tracking-wide">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

// 和風ステータスインジケーター
const StatusIndicator = ({ status }: { status: string }) => (
  <div className="flex items-center justify-center">
    <div className="card px-6 py-3 card-hover">
      <div className="flex items-center space-x-3 text-sm">
        <div className={`w-3 h-3 rounded-full ${
          status === 'healthy' ? 'bg-matcha-500 animate-pulse' : 
          status === 'error' ? 'bg-sakura-500' : 'bg-gold-500 animate-pulse'
        }`} />
        <Activity size={16} className="text-sumi-500" />
        <span className="text-sumi-600 font-medium">システム状態:</span>
        <span className={`font-bold tracking-wide ${
          status === 'healthy' ? 'text-matcha-600' : 
          status === 'error' ? 'text-sakura-600' : 'text-gold-600'
        }`}>
          {status === 'healthy' ? '正常' : 
           status === 'error' ? '停止中' : '確認中...'}
        </span>
      </div>
    </div>
  </div>
)

type TabType = 'upload' | 'camera' | 'gallery' | 'dashboard' | 'detail'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('upload')
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptData | null>(null)
  const [receipts, setReceipts] = useState<ReceiptData[]>([])
  const [healthStatus, setHealthStatus] = useState<string>('checking')
  const [showCamera, setShowCamera] = useState(false)

  useEffect(() => {
    // ヘルスチェック
    fetch('/api/health')
      .then(() => setHealthStatus('healthy'))
      .catch(() => setHealthStatus('error'))
    
    // サンプルデータを追加（実際の実装では、APIから取得）
    const sampleReceipts: ReceiptData[] = [
      {
        id: 1,
        filename: 'receipt_001.jpg',
        store_name: 'スーパーマーケットA',
        store_address: '東京都渋谷区1-1-1',
        transaction_date: '2025-01-20',
        transaction_time: '14:30',
        total_amount: 2580,
        items: [
          { name: '牛肉', category: '食品・飲料', total_price: 1200 },
          { name: '野菜セット', category: '食品・飲料', total_price: 680 },
          { name: '調味料', category: '食品・飲料', total_price: 700 }
        ],
        processed_at: '2025-01-20T14:35:00Z'
      },
      {
        id: 2,
        filename: 'receipt_002.jpg',
        store_name: 'コンビニB',
        store_address: '東京都新宿区2-2-2',
        transaction_date: '2025-01-19',
        transaction_time: '09:15',
        total_amount: 890,
        items: [
          { name: 'おにぎり', category: '食品・飲料', total_price: 150 },
          { name: 'コーヒー', category: '食品・飲料', total_price: 120 },
          { name: '雑誌', category: '書籍・雑誌', total_price: 620 }
        ],
        processed_at: '2025-01-19T09:20:00Z'
      }
    ]
    setReceipts(sampleReceipts)
  }, [])

  const handleReceiptProcessed = (receipt: ReceiptData) => {
    const newReceipt = { ...receipt, id: receipts.length + 1 }
    setReceipts(prev => [newReceipt, ...prev])
    setCurrentReceipt(newReceipt)
    setActiveTab('detail')
  }

  const handleCameraCapture = (file: File) => {
    // カメラで撮影されたファイルを処理
    const formData = new FormData()
    formData.append('file', file)
    formData.append('model', 'gemini')

    fetch('/api/process-receipt', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(result => {
      handleReceiptProcessed(result)
    })
    .catch(error => {
      console.error('Error processing camera capture:', error)
    })
    
    setShowCamera(false)
  }

  const handleReceiptSelect = (receipt: ReceiptData) => {
    setCurrentReceipt(receipt)
    setActiveTab('detail')
  }

  const handleReceiptDelete = (receiptId: number) => {
    setReceipts(prev => prev.filter(r => r.id !== receiptId))
  }

  const tabs = [
    { id: 'upload' as TabType, label: 'アップロード', icon: Upload },
    { id: 'camera' as TabType, label: '撮影', icon: Camera },
    { id: 'gallery' as TabType, label: 'ギャラリー', icon: ImageIcon },
    { id: 'dashboard' as TabType, label: 'ダッシュボード', icon: BarChart3 },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <div className="max-w-3xl mx-auto">
            <div className="text-center space-y-8 mb-12">
              <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-indigo-50 to-matcha-50 text-indigo-700 rounded-2xl text-sm font-medium wa-shadow-soft">
                <Sparkles size={18} />
                <span className="tracking-wide">AI搭載レシート認識システム</span>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl font-bold wa-text-gradient">
                  レシートをアップロード
                </h2>
                
                <p className="text-sumi-600 text-lg leading-relaxed">
                  画像を選択して、AIが自動でレシート情報を読み取ります
                </p>
              </div>
            </div>
            <ReceiptUpload onReceiptProcessed={handleReceiptProcessed} />
          </div>
        )
      
      case 'camera':
        return (
          <div className="max-w-3xl mx-auto text-center space-y-12">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-matcha-50 to-indigo-50 text-matcha-700 rounded-2xl text-sm font-medium wa-shadow-soft">
                <Camera size={18} />
                <span className="tracking-wide">カメラ撮影モード</span>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl font-bold wa-text-gradient">
                  レシートを撮影
                </h2>
                
                <p className="text-sumi-600 text-lg leading-relaxed">
                  カメラでレシートを直接撮影して、瞬時に情報を取得
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowCamera(true)}
              className="btn-primary text-lg px-12 py-5 rounded-2xl"
            >
              <Camera size={28} className="mr-4" />
              <span className="tracking-wide">カメラを起動</span>
            </button>
          </div>
        )
      
      case 'gallery':
        return (
          <PhotoGallery 
            receipts={receipts}
            onReceiptSelect={handleReceiptSelect}
            onReceiptDelete={handleReceiptDelete}
          />
        )
      
      case 'dashboard':
        return <UsageDashboard receipts={receipts} />
      
      case 'detail':
        return currentReceipt ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">レシート詳細</h2>
              <button
                onClick={() => setActiveTab('gallery')}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
                <span>閉じる</span>
              </button>
            </div>
            <ReceiptDisplay receipt={currentReceipt} />
          </div>
        ) : null
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-8">
          <StatusIndicator status={healthStatus} />

          {/* 和風タブナビゲーション */}
          {activeTab !== 'detail' && (
            <div className="card p-3">
              <div className="flex space-x-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                        isActive
                          ? 'wa-gradient-primary text-washi-50 wa-shadow-medium'
                          : 'text-sumi-600 hover:text-sumi-800 hover:bg-washi-100/80'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="tracking-wide">{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* タブコンテンツ */}
          <div className="animate-fade-in">
            {renderTabContent()}
          </div>
        </div>
      </main>

      {/* カメラモーダル */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  )
}
```

`app\app\types.ts`

**サイズ**: 532.0 B | **行数**: 25 行
```typescript
export interface ReceiptItem {
  name: string
  category?: string
  subcategory?: string
  quantity?: number
  unit_price?: number
  total_price?: number
}

export interface ReceiptData {
  id?: number
  filename?: string
  store_name?: string
  store_address?: string
  store_phone?: string
  transaction_date?: string
  transaction_time?: string
  receipt_number?: string
  subtotal?: number
  tax?: number
  total_amount?: number
  payment_method?: string
  items?: ReceiptItem[]
  processed_at?: string
}
```

`app\app\api\health\route.ts`

**サイズ**: 820.0 B | **行数**: 34 行
```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // HARINAサービスのヘルスチェック
    const harinaResponse = await fetch(`${process.env.HARINA_API_URL || 'http://harina:8000'}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!harinaResponse.ok) {
      throw new Error('HARINA service is not available')
    }

    return NextResponse.json({ 
      status: 'healthy',
      services: {
        harina: 'online',
        database: 'online'
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Service unavailable'
      },
      { status: 503 }
    )
  }
}
```

`app\app\api\process-receipt\route.ts`

**サイズ**: 2.0 KB | **行数**: 60 行
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { ReceiptData } from '../../types'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const model = formData.get('model') as string || 'gemini'

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      )
    }

    // HARINAサービスにファイルを送信
    const harinaFormData = new FormData()
    harinaFormData.append('file', file)
    harinaFormData.append('model', model)

    const harinaResponse = await fetch(`${process.env.HARINA_API_URL || 'http://harina:8000'}/process`, {
      method: 'POST',
      body: harinaFormData,
    })

    if (!harinaResponse.ok) {
      throw new Error(`HARINA service error: ${harinaResponse.status}`)
    }

    const harinaResult = await harinaResponse.json()

    // レスポンスデータを整形
    const receiptData: ReceiptData = {
      filename: file.name,
      store_name: harinaResult.store_name,
      store_address: harinaResult.store_address,
      store_phone: harinaResult.store_phone,
      transaction_date: harinaResult.transaction_date,
      transaction_time: harinaResult.transaction_time,
      receipt_number: harinaResult.receipt_number,
      subtotal: parseFloat(harinaResult.subtotal) || 0,
      tax: parseFloat(harinaResult.tax) || 0,
      total_amount: parseFloat(harinaResult.total_amount) || 0,
      payment_method: harinaResult.payment_method,
      items: harinaResult.items || [],
      processed_at: new Date().toISOString()
    }

    // TODO: データベースに保存する処理を追加

    return NextResponse.json(receiptData)
  } catch (error) {
    console.error('Receipt processing error:', error)
    return NextResponse.json(
      { error: 'レシート処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
```

`app\app\components\CameraCapture.tsx`

**サイズ**: 6.1 KB | **行数**: 183 行
```plaintext
'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, X, RotateCcw, Check } from 'lucide-react'

interface CameraCaptureProps {
  onCapture: (file: File) => void
  onClose: () => void
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsStreaming(true)
      }
    } catch (error) {
      console.error('カメラアクセスエラー:', error)
      alert('カメラにアクセスできませんでした。ブラウザの設定を確認してください。')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsStreaming(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedImage(imageDataUrl)
    stopCamera()
  }, [stopCamera])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    startCamera()
  }, [startCamera])

  const confirmPhoto = useCallback(() => {
    if (!capturedImage) return

    // DataURLをFileオブジェクトに変換
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `receipt_${Date.now()}.jpg`, { type: 'image/jpeg' })
        onCapture(file)
        handleClose()
      })
  }, [capturedImage, onCapture])

  const handleClose = useCallback(() => {
    stopCamera()
    setCapturedImage(null)
    onClose()
  }, [stopCamera, onClose])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative w-full h-full max-w-4xl max-h-screen p-4">
        {/* ヘッダー */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
          <h2 className="text-white text-xl font-semibold">レシート撮影</h2>
          <button
            onClick={handleClose}
            className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* カメラビューまたはキャプチャ画像 */}
        <div className="relative w-full h-full flex items-center justify-center">
          {!isStreaming && !capturedImage && (
            <div className="text-center space-y-4">
              <Camera className="mx-auto text-white" size={64} />
              <p className="text-white text-lg">カメラを起動してレシートを撮影</p>
              <button
                onClick={startCamera}
                className="btn-primary"
              >
                カメラを起動
              </button>
            </div>
          )}

          {isStreaming && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain rounded-lg"
              />
              
              {/* 撮影ガイド */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="border-2 border-white/50 border-dashed rounded-lg w-80 h-96 flex items-center justify-center">
                    <p className="text-white/70 text-sm">レシートをここに合わせてください</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {capturedImage && (
            <img
              src={capturedImage}
              alt="撮影されたレシート"
              className="w-full h-full object-contain rounded-lg"
            />
          )}
        </div>

        {/* コントロールボタン */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          {isStreaming && (
            <button
              onClick={capturePhoto}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
            >
              <Camera className="text-gray-800" size={24} />
            </button>
          )}

          {capturedImage && (
            <div className="flex space-x-4">
              <button
                onClick={retakePhoto}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RotateCcw size={20} />
                <span>撮り直し</span>
              </button>
              <button
                onClick={confirmPhoto}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Check size={20} />
                <span>使用する</span>
              </button>
            </div>
          )}
        </div>

        {/* 隠しcanvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
```

`app\app\components\PhotoGallery.tsx`

**サイズ**: 8.4 KB | **行数**: 199 行
```plaintext
'use client'

import { useState, useEffect } from 'react'
import { Image as ImageIcon, Calendar, Store, Trash2, Eye, Download, X } from 'lucide-react'
import { ReceiptData } from '../types'

interface PhotoGalleryProps {
  receipts: ReceiptData[]
  onReceiptSelect: (receipt: ReceiptData) => void
  onReceiptDelete?: (receiptId: number) => void
}

export default function PhotoGallery({ receipts, onReceiptSelect, onReceiptDelete }: PhotoGalleryProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleReceiptClick = (receipt: ReceiptData) => {
    setSelectedReceipt(receipt)
    setIsModalOpen(true)
  }

  const handleViewDetails = () => {
    if (selectedReceipt) {
      onReceiptSelect(selectedReceipt)
      setIsModalOpen(false)
    }
  }

  const handleDelete = (receiptId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onReceiptDelete && confirm('このレシートを削除しますか？')) {
      onReceiptDelete(receiptId)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '日付不明'
    try {
      return new Date(dateStr).toLocaleDateString('ja-JP')
    } catch {
      return dateStr
    }
  }

  if (receipts.length === 0) {
    return (
      <div className="text-center py-24 space-y-6">
        <div className="p-6 bg-gradient-to-br from-washi-200 to-washi-300 rounded-3xl inline-block">
          <ImageIcon className="mx-auto text-sumi-400" size={80} />
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-bold wa-text-gradient">レシートがありません</h3>
          <p className="text-sumi-500 text-lg leading-relaxed">撮影またはアップロードしたレシートがここに表示されます</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold wa-text-gradient tracking-wide">レシート一覧</h2>
          <div className="px-4 py-2 bg-washi-200/60 rounded-xl">
            <span className="text-sm text-sumi-600 font-medium">{receipts.length}件のレシート</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {receipts.map((receipt, index) => (
            <div
              key={receipt.id || index}
              onClick={() => handleReceiptClick(receipt)}
              className="card p-6 card-hover cursor-pointer group"
            >
              {/* レシート画像プレビュー（仮想） */}
              <div className="aspect-[3/4] bg-gradient-to-br from-washi-200 to-washi-300 rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden">
                <ImageIcon className="text-sumi-400" size={40} />
                <div className="absolute inset-0 bg-gradient-to-t from-sumi-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* アクションボタン */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {receipt.id && onReceiptDelete && (
                    <button
                      onClick={(e) => handleDelete(receipt.id!, e)}
                      className="p-2 bg-sakura-500 text-washi-50 rounded-xl hover:bg-sakura-600 transition-colors wa-shadow-soft"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* レシート情報 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-sumi-600">
                  <Store size={16} />
                  <span className="truncate font-medium">{receipt.store_name || '店舗名不明'}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-sm text-sumi-600">
                  <Calendar size={16} />
                  <span className="font-medium">{formatDate(receipt.transaction_date)}</span>
                </div>

                <div className="text-right">
                  <span className="text-xl font-bold wa-text-gradient">
                    ¥{receipt.total_amount?.toLocaleString() || '0'}
                  </span>
                </div>

                <div className="text-xs text-sumi-500 font-medium">
                  {receipt.items?.length || 0}点の商品
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 和風モーダル */}
      {isModalOpen && selectedReceipt && (
        <div className="fixed inset-0 bg-sumi-900 bg-opacity-60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-washi-50 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto wa-shadow-medium">
            <div className="p-8">
              {/* ヘッダー */}
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold wa-text-gradient tracking-wide">レシート詳細</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 hover:bg-washi-200 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* レシート画像プレビュー */}
              <div className="aspect-[3/4] bg-gradient-to-br from-washi-200 to-washi-300 rounded-2xl mb-8 flex items-center justify-center">
                <ImageIcon className="text-sumi-400" size={60} />
              </div>

              {/* レシート情報 */}
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-sumi-600 tracking-wide">店舗名</label>
                  <p className="text-sumi-800 font-bold text-lg mt-1">{selectedReceipt.store_name || '不明'}</p>
                </div>

                <div>
                  <label className="text-sm font-bold text-sumi-600 tracking-wide">取引日時</label>
                  <p className="text-sumi-800 font-medium mt-1">
                    {formatDate(selectedReceipt.transaction_date)} {selectedReceipt.transaction_time}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-sumi-600 tracking-wide">合計金額</label>
                  <p className="text-3xl font-bold wa-text-gradient mt-2">
                    ¥{selectedReceipt.total_amount?.toLocaleString() || '0'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-sumi-600 tracking-wide">商品数</label>
                  <p className="text-sumi-800 font-bold text-lg mt-1">{selectedReceipt.items?.length || 0}点</p>
                </div>

                {selectedReceipt.payment_method && (
                  <div>
                    <label className="text-sm font-bold text-sumi-600 tracking-wide">支払い方法</label>
                    <p className="text-sumi-800 font-medium mt-1">{selectedReceipt.payment_method}</p>
                  </div>
                )}
              </div>

              {/* アクションボタン */}
              <div className="flex space-x-4 mt-8">
                <button
                  onClick={handleViewDetails}
                  className="flex-1 flex items-center justify-center space-x-3 btn-primary rounded-2xl py-4"
                >
                  <Eye size={20} />
                  <span className="tracking-wide">詳細を見る</span>
                </button>
                
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-4 border border-washi-400 text-sumi-700 rounded-2xl hover:bg-washi-100 transition-colors font-medium tracking-wide"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

`app\app\components\ReceiptDisplay.tsx`

**サイズ**: 8.9 KB | **行数**: 206 行
```plaintext
'use client'

import { ReceiptData } from '../types'
import { Calendar, MapPin, Phone, CreditCard, Receipt, Store, ShoppingBag, Calculator, Tag } from 'lucide-react'

interface ReceiptDisplayProps {
  receipt: ReceiptData
}

const categoryColors = [
  'bg-indigo-100 text-indigo-800',
  'bg-matcha-100 text-matcha-800',
  'bg-sakura-100 text-sakura-800',
  'bg-gold-100 text-gold-800',
  'bg-washi-300 text-sumi-800',
  'bg-sumi-200 text-sumi-800',
]

const getCategoryColor = (category: string) => {
  const hash = category.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  return categoryColors[Math.abs(hash) % categoryColors.length]
}

export default function ReceiptDisplay({ receipt }: ReceiptDisplayProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in">
      {/* レシート基本情報 */}
      <div className="card p-10 card-hover">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl">
            <Receipt className="text-indigo-700" size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-bold wa-text-gradient tracking-wide">レシート情報</h2>
            <p className="text-sumi-600 text-lg mt-1">店舗・取引詳細</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <Store size={24} className="text-sumi-500 mt-1" />
              <div className="flex-1">
                <p className="font-bold text-sumi-800 text-xl tracking-wide">
                  {receipt.store_name || '店舗名不明'}
                </p>
                {receipt.store_address && (
                  <p className="text-sumi-600 mt-2 leading-relaxed text-lg">
                    {receipt.store_address}
                  </p>
                )}
              </div>
            </div>
            
            {receipt.store_phone && (
              <div className="flex items-center space-x-4">
                <Phone size={20} className="text-sumi-500" />
                <p className="text-sumi-700 font-bold text-lg">{receipt.store_phone}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <Calendar size={20} className="text-sumi-500" />
              <div>
                <p className="text-sumi-700 font-bold text-lg">
                  {receipt.transaction_date} {receipt.transaction_time}
                </p>
                <p className="text-sumi-500 text-sm mt-1 tracking-wide">取引日時</p>
              </div>
            </div>
            
            {receipt.payment_method && (
              <div className="flex items-center space-x-4">
                <CreditCard size={20} className="text-sumi-500" />
                <div>
                  <p className="text-sumi-700 font-bold text-lg">{receipt.payment_method}</p>
                  <p className="text-sumi-500 text-sm mt-1 tracking-wide">支払い方法</p>
                </div>
              </div>
            )}
            
            {receipt.receipt_number && (
              <div className="p-6 bg-washi-200/60 rounded-2xl">
                <p className="text-sumi-500 text-sm mb-2 font-medium tracking-wide">レシート番号</p>
                <p className="font-mono text-sumi-800 font-bold text-lg">
                  {receipt.receipt_number}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 商品一覧 */}
      <div className="card p-10 card-hover">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-4 bg-gradient-to-br from-matcha-100 to-matcha-200 rounded-2xl">
            <ShoppingBag className="text-matcha-700" size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-bold wa-text-gradient tracking-wide">購入商品</h3>
            <p className="text-sumi-600 text-lg mt-1">
              {receipt.items?.length || 0}点の商品
            </p>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-2xl border border-washi-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-washi-200/60">
                <tr>
                  <th className="text-left py-6 px-8 font-bold text-sumi-700 tracking-wide">商品名</th>
                  <th className="text-left py-6 px-8 font-bold text-sumi-700 tracking-wide">カテゴリ</th>
                  <th className="text-center py-6 px-8 font-bold text-sumi-700 tracking-wide">数量</th>
                  <th className="text-right py-6 px-8 font-bold text-sumi-700 tracking-wide">単価</th>
                  <th className="text-right py-6 px-8 font-bold text-sumi-700 tracking-wide">小計</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-washi-300">
                {receipt.items?.map((item, index) => (
                  <tr key={index} className="hover:bg-washi-100/50 transition-colors duration-300">
                    <td className="py-6 px-8">
                      <div>
                        <p className="font-bold text-sumi-800 leading-tight text-lg tracking-wide">
                          {item.name}
                        </p>
                        {item.subcategory && (
                          <p className="text-sm text-sumi-500 mt-2 font-medium">
                            {item.subcategory}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold ${
                        getCategoryColor(item.category || '未分類')
                      }`}>
                        <Tag size={14} className="mr-2" />
                        {item.category || '未分類'}
                      </span>
                    </td>
                    <td className="py-6 px-8 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 bg-washi-200 rounded-xl text-sm font-bold text-sumi-700">
                        {item.quantity || 1}
                      </span>
                    </td>
                    <td className="py-6 px-8 text-right font-bold text-sumi-700 text-lg">
                      ¥{item.unit_price?.toLocaleString() || '0'}
                    </td>
                    <td className="py-6 px-8 text-right font-bold wa-text-gradient text-xl">
                      ¥{item.total_price?.toLocaleString() || '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 合計金額 */}
      <div className="card p-10 card-hover">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-4 bg-gradient-to-br from-gold-100 to-gold-200 rounded-2xl">
            <Calculator className="text-gold-700" size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-bold wa-text-gradient tracking-wide">合計</h3>
            <p className="text-sumi-600 text-lg mt-1">支払い詳細</p>
          </div>
        </div>
        
        <div className="bg-washi-200/60 rounded-2xl p-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center py-3">
              <span className="text-sumi-600 font-bold text-lg tracking-wide">小計</span>
              <span className="text-sumi-800 font-bold text-xl">
                ¥{receipt.subtotal?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sumi-600 font-bold text-lg tracking-wide">税額</span>
              <span className="text-sumi-800 font-bold text-xl">
                ¥{receipt.tax?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="border-t border-washi-400 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-sumi-800 tracking-wide">合計金額</span>
                <span className="text-4xl font-bold wa-text-gradient">
                  ¥{receipt.total_amount?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

`app\app\components\ReceiptUpload.tsx`

**サイズ**: 7.6 KB | **行数**: 207 行
```plaintext
'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2, Sparkles, Brain, Zap } from 'lucide-react'
import { toast } from 'react-toastify'
import { ReceiptData } from '../types'

interface ReceiptUploadProps {
  onReceiptProcessed: (receipt: ReceiptData) => void
}

const modelOptions = [
  { 
    value: 'gemini', 
    label: 'Gemini', 
    icon: Sparkles, 
    description: '高精度・高速処理',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  },
  { 
    value: 'gpt-4o', 
    label: 'GPT-4o', 
    icon: Brain, 
    description: '詳細な分析',
    color: 'text-matcha-600',
    bgColor: 'bg-matcha-50',
    borderColor: 'border-matcha-200'
  },
  { 
    value: 'claude', 
    label: 'Claude', 
    icon: Zap, 
    description: '正確な認識',
    color: 'text-sakura-600',
    bgColor: 'bg-sakura-50',
    borderColor: 'border-sakura-200'
  },
]

export default function ReceiptUpload({ onReceiptProcessed }: ReceiptUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gemini')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    if (!file.type.startsWith('image/')) {
      toast.error('画像ファイルを選択してください', {
        position: "top-center",
        autoClose: 3000,
      })
      return
    }

    setIsProcessing(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('model', selectedModel)

      const response = await fetch('/api/process-receipt', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('レシート処理に失敗しました')
      }

      const result = await response.json()
      onReceiptProcessed(result)
      toast.success('レシートを正常に処理しました！', {
        position: "top-center",
        autoClose: 3000,
      })
    } catch (error) {
      console.error('Error processing receipt:', error)
      toast.error('レシート処理中にエラーが発生しました', {
        position: "top-center",
        autoClose: 5000,
      })
    } finally {
      setIsProcessing(false)
    }
  }, [selectedModel, onReceiptProcessed])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp']
    },
    multiple: false
  })

  const selectedModelData = modelOptions.find(m => m.value === selectedModel)

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      {/* モデル選択 */}
      <div className="space-y-6">
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-bold wa-text-gradient">AIモデルを選択</h3>
          <p className="text-sumi-600 leading-relaxed">用途に応じて最適なAIモデルをお選びください</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {modelOptions.map((model) => {
            const Icon = model.icon
            const isSelected = selectedModel === model.value
            
            return (
              <button
                key={model.value}
                onClick={() => setSelectedModel(model.value)}
                disabled={isProcessing}
                className={`card p-6 text-left transition-all duration-300 ${
                  isSelected 
                    ? `ring-2 ${model.borderColor.replace('border-', 'ring-')} ${model.bgColor} border-transparent wa-shadow-medium` 
                    : 'card-hover'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 ${model.bgColor} rounded-xl`}>
                    <Icon className={`${model.color}`} size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sumi-800 text-lg tracking-wide">{model.label}</p>
                    <p className="text-sm text-sumi-500 mt-2 leading-relaxed">{model.description}</p>
                  </div>
                  {isSelected && (
                    <div className={`w-3 h-3 ${model.color.replace('text-', 'bg-')} rounded-full animate-pulse`} />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ファイルアップロード */}
      <div
        {...getRootProps()}
        className={`upload-zone p-16 text-center cursor-pointer ${
          isDragActive ? 'upload-zone-active' : ''
        } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <div className="space-y-8 animate-scale-in">
            <div className="relative">
              <Loader2 className="mx-auto h-20 w-20 text-indigo-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                {selectedModelData && (
                  <selectedModelData.icon className={`${selectedModelData.color} animate-pulse`} size={28} />
                )}
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-2xl font-bold wa-text-gradient">解析中...</p>
              <p className="text-sumi-600 text-lg leading-relaxed">
                {selectedModelData?.label}でレシートを解析しています
              </p>
              <div className="mt-6 w-64 mx-auto bg-washi-300 rounded-full h-2">
                <div className="wa-gradient-primary h-2 rounded-full animate-pulse" style={{width: '60%'}} />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <div className="relative">
              <Upload className={`mx-auto h-20 w-20 transition-colors duration-300 ${
                isDragActive ? 'text-matcha-500 animate-float' : 'text-sumi-400'
              }`} />
              {isDragActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 border-2 border-matcha-500 border-dashed rounded-full animate-ping" />
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-2xl font-bold wa-text-gradient">
                  {isDragActive ? 'ファイルをドロップしてください' : 'レシート画像をアップロード'}
                </p>
                <p className="text-sumi-600 text-lg leading-relaxed">
                  ドラッグ&ドロップまたはクリックしてファイルを選択
                </p>
              </div>
              
              <div className="inline-flex items-center space-x-3 px-6 py-3 bg-washi-200/60 rounded-2xl text-sm text-sumi-600">
                <span className="font-medium">対応形式:</span>
                <span className="font-bold tracking-wide">JPEG, PNG, GIF, BMP</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

`app\app\components\UsageDashboard.tsx`

**サイズ**: 11.4 KB | **行数**: 285 行
```plaintext
'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Calendar, DollarSign, ShoppingBag, Brain, Zap, Sparkles } from 'lucide-react'
import { ReceiptData } from '../types'

interface UsageDashboardProps {
  receipts: ReceiptData[]
}

interface UsageStats {
  totalReceipts: number
  totalAmount: number
  totalItems: number
  avgAmount: number
  monthlyData: { month: string; count: number; amount: number }[]
  categoryData: { category: string; count: number; amount: number }[]
  modelUsage: { model: string; count: number; percentage: number }[]
}

export default function UsageDashboard({ receipts }: UsageDashboardProps) {
  const [stats, setStats] = useState<UsageStats>({
    totalReceipts: 0,
    totalAmount: 0,
    totalItems: 0,
    avgAmount: 0,
    monthlyData: [],
    categoryData: [],
    modelUsage: []
  })

  useEffect(() => {
    calculateStats()
  }, [receipts])

  const calculateStats = () => {
    if (receipts.length === 0) {
      setStats({
        totalReceipts: 0,
        totalAmount: 0,
        totalItems: 0,
        avgAmount: 0,
        monthlyData: [],
        categoryData: [],
        modelUsage: []
      })
      return
    }

    const totalReceipts = receipts.length
    const totalAmount = receipts.reduce((sum, receipt) => sum + (receipt.total_amount || 0), 0)
    const totalItems = receipts.reduce((sum, receipt) => sum + (receipt.items?.length || 0), 0)
    const avgAmount = totalAmount / totalReceipts

    // 月別データ
    const monthlyMap = new Map<string, { count: number; amount: number }>()
    receipts.forEach(receipt => {
      if (receipt.transaction_date) {
        const month = receipt.transaction_date.substring(0, 7) // YYYY-MM
        const existing = monthlyMap.get(month) || { count: 0, amount: 0 }
        monthlyMap.set(month, {
          count: existing.count + 1,
          amount: existing.amount + (receipt.total_amount || 0)
        })
      }
    })

    const monthlyData = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // カテゴリ別データ
    const categoryMap = new Map<string, { count: number; amount: number }>()
    receipts.forEach(receipt => {
      receipt.items?.forEach(item => {
        const category = item.category || '未分類'
        const existing = categoryMap.get(category) || { count: 0, amount: 0 }
        categoryMap.set(category, {
          count: existing.count + 1,
          amount: existing.amount + (item.total_price || 0)
        })
      })
    })

    const categoryData = Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5) // トップ5

    // モデル使用状況（仮想データ）
    const modelUsage = [
      { model: 'Gemini', count: Math.floor(totalReceipts * 0.6), percentage: 60 },
      { model: 'GPT-4o', count: Math.floor(totalReceipts * 0.25), percentage: 25 },
      { model: 'Claude', count: Math.floor(totalReceipts * 0.15), percentage: 15 }
    ]

    setStats({
      totalReceipts,
      totalAmount,
      totalItems,
      avgAmount,
      monthlyData,
      categoryData,
      modelUsage
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    return `${year}年${parseInt(month)}月`
  }

  const getModelIcon = (model: string) => {
    switch (model) {
      case 'Gemini': return <Sparkles className="text-indigo-600" size={18} />
      case 'GPT-4o': return <Brain className="text-matcha-600" size={18} />
      case 'Claude': return <Zap className="text-sakura-600" size={18} />
      default: return <Brain className="text-sumi-600" size={18} />
    }
  }

  return (
    <div className="space-y-12">
      {/* 概要統計 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="card p-8 card-hover">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl">
              <BarChart3 className="text-indigo-700" size={28} />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-sumi-600 font-medium tracking-wide">総レシート数</p>
              <p className="text-3xl font-bold wa-text-gradient">{stats.totalReceipts}</p>
            </div>
          </div>
        </div>

        <div className="card p-8 card-hover">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-matcha-100 to-matcha-200 rounded-2xl">
              <DollarSign className="text-matcha-700" size={28} />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-sumi-600 font-medium tracking-wide">総支出額</p>
              <p className="text-3xl font-bold wa-text-gradient">{formatCurrency(stats.totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="card p-8 card-hover">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-sakura-100 to-sakura-200 rounded-2xl">
              <ShoppingBag className="text-sakura-700" size={28} />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-sumi-600 font-medium tracking-wide">総商品数</p>
              <p className="text-3xl font-bold wa-text-gradient">{stats.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="card p-8 card-hover">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-gold-100 to-gold-200 rounded-2xl">
              <TrendingUp className="text-gold-700" size={28} />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-sumi-600 font-medium tracking-wide">平均支出額</p>
              <p className="text-3xl font-bold wa-text-gradient">{formatCurrency(stats.avgAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 月別推移 */}
      <div className="card p-8 card-hover">
        <h3 className="text-2xl font-bold wa-text-gradient mb-8 tracking-wide">月別推移</h3>
        {stats.monthlyData.length > 0 ? (
          <div className="space-y-6">
            {stats.monthlyData.map((data, index) => (
              <div key={data.month} className="flex items-center space-x-6">
                <div className="w-24 text-sm text-sumi-600 font-medium">
                  {formatMonth(data.month)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-sumi-700 font-medium">{data.count}件</span>
                    <span className="text-sm font-bold wa-text-gradient">
                      {formatCurrency(data.amount)}
                    </span>
                  </div>
                  <div className="w-full bg-washi-300 rounded-full h-3">
                    <div
                      className="wa-gradient-primary h-3 rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min((data.amount / Math.max(...stats.monthlyData.map(d => d.amount))) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sumi-500 text-center py-12 text-lg">データがありません</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* カテゴリ別支出 */}
        <div className="card p-8 card-hover">
          <h3 className="text-2xl font-bold wa-text-gradient mb-8 tracking-wide">カテゴリ別支出（トップ5）</h3>
          {stats.categoryData.length > 0 ? (
            <div className="space-y-6">
              {stats.categoryData.map((data, index) => (
                <div key={data.category} className="flex items-center space-x-5">
                  <div className="w-5 h-5 rounded-full wa-gradient-accent" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-sumi-800 tracking-wide">{data.category}</span>
                      <span className="text-sm text-sumi-600 font-medium">{data.count}点</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="w-full bg-washi-300 rounded-full h-3 mr-4">
                        <div
                          className="wa-gradient-accent h-3 rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min((data.amount / Math.max(...stats.categoryData.map(d => d.amount))) * 100, 100)}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold wa-text-gradient whitespace-nowrap">
                        {formatCurrency(data.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sumi-500 text-center py-12 text-lg">データがありません</p>
          )}
        </div>

        {/* AIモデル使用状況 */}
        <div className="card p-8 card-hover">
          <h3 className="text-2xl font-bold wa-text-gradient mb-8 tracking-wide">AIモデル使用状況</h3>
          <div className="space-y-6">
            {stats.modelUsage.map((data, index) => (
              <div key={data.model} className="flex items-center space-x-5">
                <div className="p-2 bg-washi-200 rounded-xl">
                  {getModelIcon(data.model)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-sumi-800 tracking-wide">{data.model}</span>
                    <span className="text-sm text-sumi-600 font-medium">{data.count}回</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 bg-washi-300 rounded-full h-3">
                      <div
                        className="wa-gradient-warm h-3 rounded-full transition-all duration-700"
                        style={{ width: `${data.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold wa-text-gradient w-12 text-right">
                      {data.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

`database\init.sql`

**サイズ**: 2.5 KB | **行数**: 73 行
```sql
-- Receipt Recognition Database Initialization

-- Create database if not exists (this is handled by docker-compose environment variables)

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    store_name VARCHAR(255),
    store_address TEXT,
    store_phone VARCHAR(50),
    transaction_date VARCHAR(20),
    transaction_time VARCHAR(20),
    receipt_number VARCHAR(100),
    subtotal DECIMAL(10,2) DEFAULT 0.00,
    tax DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_method VARCHAR(50),
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create receipt_items table
CREATE TABLE IF NOT EXISTS receipt_items (
    id SERIAL PRIMARY KEY,
    receipt_id INTEGER NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) DEFAULT 0.00,
    total_price DECIMAL(10,2) DEFAULT 0.00
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_receipts_processed_at ON receipts(processed_at);
CREATE INDEX IF NOT EXISTS idx_receipts_store_name ON receipts(store_name);
CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt_id ON receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_receipt_items_category ON receipt_items(category);

-- Insert sample data for testing
INSERT INTO receipts (
    filename, store_name, store_address, store_phone, 
    transaction_date, transaction_time, receipt_number,
    subtotal, tax, total_amount, payment_method
) VALUES (
    'sample_receipt.jpg', 
    'サンプルストア', 
    '東京都渋谷区1-1-1', 
    '03-1234-5678',
    '2025-01-15', 
    '14:30', 
    'R001',
    1000.00, 
    100.00, 
    1100.00, 
    'クレジット'
) ON CONFLICT DO NOTHING;

-- Get the receipt ID for sample items
DO $$
DECLARE
    sample_receipt_id INTEGER;
BEGIN
    SELECT id INTO sample_receipt_id FROM receipts WHERE filename = 'sample_receipt.jpg' LIMIT 1;
    
    IF sample_receipt_id IS NOT NULL THEN
        INSERT INTO receipt_items (receipt_id, name, category, subcategory, quantity, unit_price, total_price)
        VALUES 
            (sample_receipt_id, 'サンプル商品1', '食品・飲料', '肉類', 2, 300.00, 600.00),
            (sample_receipt_id, 'サンプル商品2', '日用品・雑貨', '洗剤・清掃用品', 1, 400.00, 400.00)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
```

`harina\Dockerfile`

**サイズ**: 455.0 B | **行数**: 15 行
```dockerfile
FROM ghcr.io/astral-sh/uv:python3.11-bookworm

# HARINA v3 CLIをGitHubからクローン（developブランチ）
RUN git clone -b develop https://github.com/Sunwood-ai-labs/harina-v3-cli.git /app

WORKDIR /app

# uvを使って依存関係をインストール
RUN uv sync --frozen

# ポート8000を公開
EXPOSE 8000

# HARINAのFastAPIサーバーを起動
CMD ["uv", "run", "harina", "--server", "--host", "0.0.0.0", "--port", "8000"]
```


</Repository information>

</Input information>

上記の情報のみを使用してリリースノートを作成してください。
不明な点や情報が不足している部分については、推測せずにその旨を明記してください。
各項目の確信度を 🟢、🟡、🔴 で示し、提供された情報に直接基づいている場合は 🟢、やや推測を含む場合は 🟡、大きく推測している場合は 🔴 としてください。
前回のリリースノートに含まれる内容と重複する項目には 🔄 を付けてください。

        