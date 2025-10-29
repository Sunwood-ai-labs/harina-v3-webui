"""FastAPI server for Harina v3 CLI - Receipt OCR API (overridden)."""

import os
import sys
import tempfile
import base64
from pathlib import Path
from typing import Optional, Tuple
from xml.etree import ElementTree as ET

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv
from loguru import logger

from .core import HarinaCore
from .utils import convert_xml_to_csv
from .category_sync import get_categories_xml, sync_categories_with_database


def _category_stats(xml_payload: str) -> Tuple[int, int]:
    try:
        root = ET.fromstring(xml_payload)
    except ET.ParseError:
        return 0, 0

    categories = root.findall("category")
    subcategories = root.findall(".//subcategory")
    return len(categories), len(subcategories)


def _log_category_snapshot(xml_payload: Optional[str]) -> None:
    if not xml_payload:
        logger.warning("⚠️ データベースからカテゴリ情報を取得できませんでした")
        return

    category_count, subcategory_count = _category_stats(xml_payload)
    logger.info(
        "📚 カテゴリ同期完了: カテゴリ {} 件 / サブカテゴリ {} 件",
        category_count,
        subcategory_count,
    )


def setup_environment():
    """環境設定"""
    load_dotenv()
    load_dotenv(Path.cwd() / '.env')

    api_keys = {
        'GEMINI_API_KEY': os.getenv('GEMINI_API_KEY'),
        'OPENAI_API_KEY': os.getenv('OPENAI_API_KEY'),
        'ANTHROPIC_API_KEY': os.getenv('ANTHROPIC_API_KEY')
    }

    available_keys = [
        key for key, value in api_keys.items()
        if value and value != 'your_api_key_here'
    ]

    if available_keys:
        logger.info(f"🔑 利用可能なAPIキー: {', '.join(available_keys)}")
    else:
        logger.warning("⚠️  APIキーが設定されていません")


def create_app() -> FastAPI:
    """FastAPIアプリケーションを作成"""
    app = FastAPI(
        title="Harina v3 Receipt OCR API",
        description="レシート画像を認識してXML/CSV形式で出力するAPI",
        version="3.1.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    class ReceiptResponse(BaseModel):
        success: bool
        data: Optional[str] = None
        format: str
        model: str
        error: Optional[str] = None
        fallbackUsed: Optional[bool] = None
        keyType: Optional[str] = None

    class Base64Request(BaseModel):
        image_base64: str
        model: str = "gemini/gemini-2.5-flash"
        format: str = "xml"
        instructions: Optional[str] = None

    @app.get("/")
    async def root():
        return {
            "message": "Harina v3 Receipt OCR API",
            "version": "3.1.0",
            "endpoints": {
                "process": "/process - レシート画像を処理（ファイルアップロード）",
                "process_base64": "/process_base64 - レシート画像を処理（BASE64）",
                "health": "/health - ヘルスチェック"
            }
        }

    @app.get("/health")
    async def health_check():
        snapshot = get_categories_xml()
        category_count, subcategory_count = _category_stats(snapshot) if snapshot else (0, 0)
        return {
            "status": "healthy",
            "service": "harina-v3-api",
            "categories": {
                "count": category_count,
                "subcategories": subcategory_count,
            },
        }

    @app.post("/maintenance/refresh-categories")
    async def refresh_categories():
        snapshot = sync_categories_with_database() or get_categories_xml(refresh=True)
        if not snapshot:
            raise HTTPException(status_code=500, detail="カテゴリ情報を更新できませんでした")
        category_count, subcategory_count = _category_stats(snapshot)
        return {
            "status": "ok",
            "categories": category_count,
            "subcategories": subcategory_count,
        }

    @app.post("/process", response_model=ReceiptResponse)
    async def process_receipt(
        file: UploadFile = File(..., description="レシート画像ファイル"),
        model: str = Form(default="gemini/gemini-2.5-flash", description="使用するAIモデル"),
        format: str = Form(default="xml", description="出力形式 (xml/csv)"),
        instructions: Optional[str] = Form(default=None, description="追加の解析指示")
    ):
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="画像ファイルをアップロードしてください")

        if format not in ['xml', 'csv']:
            raise HTTPException(status_code=400, detail="formatは 'xml' または 'csv' を指定してください")

        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                content = await file.read()
                temp_file.write(content)
                temp_file_path = Path(temp_file.name)

            try:
                ocr = HarinaCore(model_name=model)

                if instructions:
                    logger.info("🗒️ Received additional instructions: {}", instructions.strip())

                if format == 'xml':
                    result = ocr.process_receipt(
                        temp_file_path,
                        output_format='xml',
                        additional_instructions=instructions
                    )
                else:
                    xml_result = ocr.process_receipt(
                        temp_file_path,
                        output_format='xml',
                        additional_instructions=instructions
                    )
                    result = convert_xml_to_csv(xml_result)

                return ReceiptResponse(
                    success=True,
                    data=result,
                    format=format,
                    model=model,
                    fallbackUsed=ocr.last_used_fallback,
                    keyType=ocr.last_used_key_label
                )

            finally:
                if temp_file_path.exists():
                    temp_file_path.unlink()

        except Exception as e:
            logger.exception("Processing failed")
            return ReceiptResponse(success=False, format=format, model=model, error=str(e))

    @app.post("/process_base64", response_model=ReceiptResponse)
    async def process_receipt_base64(request: Base64Request):
        if request.format not in ['xml', 'csv']:
            raise HTTPException(status_code=400, detail="formatは 'xml' または 'csv' を指定してください")

        try:
            try:
                image_data = base64.b64decode(request.image_base64)
            except Exception as exc:
                raise HTTPException(status_code=400, detail="無効なBASE64データです") from exc

            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                temp_file.write(image_data)
                temp_file_path = Path(temp_file.name)

            try:
                ocr = HarinaCore(model_name=request.model)

                if request.instructions:
                    logger.info("🗒️ Received additional instructions (base64): {}", request.instructions.strip())

                if request.format == 'xml':
                    result = ocr.process_receipt(
                        temp_file_path,
                        output_format='xml',
                        additional_instructions=request.instructions
                    )
                else:
                    xml_result = ocr.process_receipt(
                        temp_file_path,
                        output_format='xml',
                        additional_instructions=request.instructions
                    )
                    result = convert_xml_to_csv(xml_result)

                return ReceiptResponse(
                    success=True,
                    data=result,
                    format=request.format,
                    model=request.model,
                    fallbackUsed=ocr.last_used_fallback,
                    keyType=ocr.last_used_key_label
                )

            finally:
                if temp_file_path.exists():
                    temp_file_path.unlink()

        except HTTPException:
            raise
        except Exception as e:
            logger.exception("Processing failed")
            return ReceiptResponse(success=False, format=request.format, model=request.model, error=str(e))

    return app


def run_server(host: str = "0.0.0.0", port: int = 8000, reload: bool = False):
    logger.info("🚀 Harina v3 Fast API サーバーを起動中...")
    logger.info("=" * 50)

    setup_environment()

    snapshot = sync_categories_with_database()
    if snapshot is None:
        snapshot = get_categories_xml(refresh=True)
    else:
        # Ensure subsequent lookups use the latest data from the database cache
        get_categories_xml(refresh=True)
    _log_category_snapshot(snapshot)

    app = create_app()

    logger.info("🌐 サーバー設定:")
    logger.info(f"   ホスト: {host}")
    logger.info(f"   ポート: {port}")
    logger.info(f"   URL: http://localhost:{port}")
    logger.info(f"   ドキュメント: http://localhost:{port}/docs")
    logger.info(f"   ReDoc: http://localhost:{port}/redoc")
    logger.info("=" * 50)

    try:
        uvicorn.run(app, host=host, port=port, reload=reload, access_log=True)
    except KeyboardInterrupt:
        logger.info("\n👋 サーバーを停止しました")
    except Exception as e:
        logger.error(f"❌ サーバー起動エラー: {e}")
        sys.exit(1)
