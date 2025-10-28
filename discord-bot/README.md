# Discord Receipt Bot

このディスコードボットは、画像が添付されたメッセージを受信すると `app` サービスの `/api/process-receipt` エンドポイントへ転送し、解析結果をチャンネルへ返信します。

## 主な機能

- メッセージの最初の画像添付を自動で取得
- 既存のレシート処理API (Next.js 経由) へ画像をアップロード
- 合計金額や商品リストなどの解析結果をメッセージで返信

## 必要な環境変数

| 変数名 | 説明 | 例 |
|--------|------|----|
| `DISCORD_BOT_TOKEN` | Discord Bot Token | `your-token` |
| `DISCORD_ALLOWED_CHANNEL_IDS` | ボットを反応させるチャンネルID（カンマ区切り、省略可） | `123456789012345678,987654321098765432` |
| `RECEIPT_API_URL` | レシート処理APIのURL | `http://app:3000/api/process-receipt` |
| `RECEIPT_MODEL` | 使用するモデル名 | `gemini` |
| `RECEIPT_UPLOADER` | DBに保存する際のアップローダ名 | `discord` |
| `DISCORD_MAX_FILE_MB` | 処理を許可する最大ファイルサイズ(MB) | `15` |

> **Note**: 画像解析APIへアクセスするため、`discord-bot` サービスは docker-compose の `receipt_network` に接続されています。

## ローカルでの実行

```bash
cd discord-bot
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export DISCORD_BOT_TOKEN=your-token
python bot.py
```

`docker-compose` 経由では `discord-bot` サービスが自動的に起動します。
