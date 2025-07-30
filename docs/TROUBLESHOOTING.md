# 🐛 トラブルシューティング

## よくある問題

### 1. APIキーエラー

**症状**: レシート処理時にAPIキーエラーが発生する

**解決方法**:
- `.env`ファイルでAPIキーが正しく設定されているか確認
- APIキーに余分なスペースや改行がないか確認
- 使用するAIプロバイダーのAPIキーが有効か確認

```bash
# .envファイルの確認
cat .env | grep API_KEY
```

### 2. Docker起動エラー

**症状**: `docker-compose up`でエラーが発生する

**解決方法**:
- ポート3000, 8000, 5432が使用されていないか確認
- 既存コンテナを停止してから再起動

```bash
# 既存コンテナの停止
docker-compose down

# ポート使用状況の確認
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000
netstat -tulpn | grep :5432

# 強制的にコンテナを削除
docker-compose down --volumes --remove-orphans
```

### 3. 画像アップロードエラー

**症状**: レシート画像のアップロードが失敗する

**解決方法**:
- 対応形式を確認: JPEG, PNG, GIF, BMP
- ファイルサイズ制限を確認（通常10MB以下）
- 画像ファイルが破損していないか確認

### 4. データベース接続エラー

**症状**: データベースに接続できない

**解決方法**:
```bash
# データベースコンテナの状態確認
docker-compose ps postgres

# データベースログの確認
docker-compose logs postgres

# データベースの再起動
docker-compose restart postgres
```

### 5. フロントエンドが表示されない

**症状**: http://localhost:3000 にアクセスできない

**解決方法**:
```bash
# アプリコンテナの状態確認
docker-compose ps app

# アプリログの確認
docker-compose logs app

# アプリの再起動
docker-compose restart app
```

## ログ確認

### エラーログの確認

```bash
# 全体のエラーログ
docker-compose logs | grep -i error

# 各サービスのエラーログ
docker-compose logs harina | grep -i error
docker-compose logs app | grep -i error
docker-compose logs postgres | grep -i error
```

### デバッグモード

開発時により詳細なログを確認したい場合：

```bash
# 環境変数でログレベルを設定
export LOG_LEVEL=DEBUG
docker-compose up
```

## パフォーマンス問題

### 処理が遅い場合

1. **AIモデルの変更**: より軽量なモデルを試す
2. **画像サイズの最適化**: 大きすぎる画像はリサイズする
3. **リソース確認**: Docker Desktopのリソース設定を確認

### メモリ不足

```bash
# Dockerのメモリ使用量確認
docker stats

# 不要なコンテナ・イメージの削除
docker system prune -a
```

## サポート

上記で解決しない問題がある場合は、以下の情報と共にGitHubのIssuesで報告してください：

1. エラーメッセージの全文
2. 実行したコマンド
3. 環境情報（OS、Dockerバージョンなど）
4. ログファイル（該当部分）