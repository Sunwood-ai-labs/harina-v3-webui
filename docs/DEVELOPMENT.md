# 🛠️ 開発ガイド

## 開発環境のセットアップ

### 個別サービスの起動

```bash
# バックエンドのみ
docker-compose up backend postgres

# フロントエンドのみ（開発モード）
cd app
npm install
npm run dev
```

### ログの確認

```bash
# 全サービスのログ
docker-compose logs -f

# 特定サービスのログ
docker-compose logs -f harina
docker-compose logs -f app
docker-compose logs -f postgres
```

## 🔧 カスタマイズ

### AIモデルの追加

`app/app/components/ReceiptUpload.tsx`でモデル選択肢を編集：

```typescript
<option value="new-model">New Model</option>
```

### UIのカスタマイズ

Tailwind CSSを使用しているため、`app/app/`内のコンポーネントで簡単にスタイル変更可能。

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
├── discord-bot/             # Discord連携ボット
│   ├── bot.py
│   ├── Dockerfile
│   └── requirements.txt
└── database/
    ├── init.sql             # データベース初期化
    └── migration_add_uploader.sql
```

## 🧪 テスト

### HARINAクライアントのテスト

```bash
cd harina
python client_sample.py
```

### データベースの確認

```bash
# PostgreSQLに接続
docker-compose exec postgres psql -U receipt_user -d receipt_db

# テーブル確認
\dt
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### Discordボットメモ

- Discordメッセージに複数画像を添付した場合でも順次処理され、同一スレッドに結果が投稿され、完了後はスレッドが自動でクローズされます。
- `DISCORD_CHANNEL_UPLOADERS` に `チャンネル名:アップローダー` を設定すると、保存時の `uploader` フィールドをチャンネル単位で切り替えられます。
- `DISCORD_RECEIPT_BASE_URL` を設定しておくと、処理完了メッセージにレシート詳細ページの共有URLが表示されます。
- `/receipts/{id}` ページで個別のレシート詳細を閲覧できます。
