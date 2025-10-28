FROM ghcr.io/astral-sh/uv:python3.11-bookworm

# HARINA v3 CLIをGitHubからクローン（developブランチ）
RUN git clone -b develop https://github.com/Sunwood-ai-labs/harina-v3-cli.git /app

COPY overrides/ /tmp/harina-overrides
RUN cp /tmp/harina-overrides/server.py /app/harina/server.py \
    && cp /tmp/harina-overrides/core.py /app/harina/core.py \
    && cp /tmp/harina-overrides/product_categories.xml /app/harina/product_categories.xml

WORKDIR /app

# uvを使って依存関係をインストール
RUN uv sync --frozen

# ポート8000を公開
EXPOSE 8000

# HARINAのFastAPIサーバーを起動
CMD ["uv", "run", "harina", "--server", "--host", "0.0.0.0", "--port", "8000"]
