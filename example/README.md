# 📚 使用例

このディレクトリには、Receipt Recognition Appの具体的な使用例とサンプルコードが含まれています。

## 📋 目次

- [基本的な使用方法](#基本的な使用方法)
- [API使用例](#api使用例)
- [カスタマイズ例](#カスタマイズ例)

## 基本的な使用方法

詳細なセットアップについては、[メインのREADME](../README.md)を参照してください。

### 1. レシート画像のアップロード

1. ブラウザで http://localhost:3000 にアクセス
2. 「ファイルを選択」ボタンまたはドラッグ&ドロップでレシート画像をアップロード
3. AIモデルを選択（Gemini、GPT-4o、Claude）
4. 「処理開始」ボタンをクリック
5. 処理結果を確認

### 2. 処理結果の確認

- **店舗情報**: 店名、住所、電話番号
- **取引情報**: 日付、時間、レシート番号
- **商品一覧**: 商品名、カテゴリ、価格
- **合計金額**: 小計、税額、合計

## API使用例

### Python クライアント

HARINAクライアントのサンプルコードは [`../harina/client_sample.py`](../harina/client_sample.py) を参照してください。

```python
import requests

# レシート処理API
response = requests.post(
    "http://localhost:8001/process",
    files={'file': open('receipt.jpg', 'rb')},
    data={'model': 'gemini/gemini-2.5-flash', 'format': 'xml'}
)

result = response.json()
if result['success']:
    print(result['data'])
```

### cURL例

```bash
# ファイルアップロード方式
curl -X POST "http://localhost:8001/process" \
  -F "file=@receipt.jpg" \
  -F "model=gemini/gemini-2.5-flash" \
  -F "format=xml"

# BASE64方式
curl -X POST "http://localhost:8001/process_base64" \
  -H "Content-Type: application/json" \
  -d '{
    "image_base64": "base64_encoded_image_data",
    "model": "gemini/gemini-2.5-flash",
    "format": "xml"
  }'
```

## カスタマイズ例

### 新しいAIモデルの追加

1. 環境変数に新しいAPIキーを追加
2. フロントエンドのモデル選択肢を更新

```typescript
// app/app/components/ReceiptUpload.tsx
<select>
  <option value="gemini/gemini-2.5-flash">Gemini 2.5 Flash</option>
  <option value="gpt-4o">GPT-4o</option>
  <option value="claude-3-sonnet">Claude 3 Sonnet</option>
  <option value="new-model">New Model</option> {/* 新しいモデル */}
</select>
```

### カスタムスタイリング

Tailwind CSSを使用してUIをカスタマイズ：

```tsx
// カスタムボタンスタイル
<button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300">
  カスタムボタン
</button>
```

## 🔗 関連リンク

- [メインドキュメント](../README.md)
- [インストールガイド](../docs/INSTALL.md)
- [開発ガイド](../docs/DEVELOPMENT.md)
- [トラブルシューティング](../docs/TROUBLESHOOTING.md)