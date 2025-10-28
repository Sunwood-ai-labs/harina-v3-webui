# SSL 証明書の配置について

`nginx` サービスは `/etc/nginx/certs/fullchain.pem` および `/etc/nginx/certs/privkey.pem` を読み込んで
HTTPS を有効化します。以下のいずれかの方法で証明書と秘密鍵を配置してください。

## 1. 既存の証明書をコピーする

商用 CA や Let's Encrypt 等で発行済みの証明書がある場合は、`fullchain.pem` と
`privkey.pem` のファイル名でこのディレクトリに配置してください。

```
nginx/
 └── certs/
     ├── fullchain.pem
     └── privkey.pem
```

## 2. 開発用途の自己署名証明書を生成する

ローカル開発や検証用途であれば、OpenSSL を用いて自己署名証明書を作成できます。

```bash
openssl req -x509 -nodes -newkey rsa:4096 \
  -keyout nginx/certs/privkey.pem \
  -out nginx/certs/fullchain.pem \
  -days 365 \
  -subj "/CN=localhost"
```

ブラウザで警告が表示される場合は、生成した証明書を信頼済みに追加してください。

> **注意:** このディレクトリに生成した鍵・証明書は機密情報です。
> 公開リポジトリにコミットしないよう `.gitignore` 等で除外してください。
