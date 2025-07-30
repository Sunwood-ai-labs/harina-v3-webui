"""
Harina v3 Fast API クライアントサンプル
"""
import sys
from pathlib import Path

# プロジェクトルートをパスに追加
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

import requests
import json
import base64
from loguru import logger

# APIサーバーのURL
API_BASE_URL = "http://localhost:8001"

def print_separator(char="=", length=60):
    """セパレーターを出力"""
    logger.info(char * length)

def print_section_header(title):
    """セクションヘッダーを出力"""
    print()
    logger.info(f"📋 {title}")
    print_separator("-", 40)

def test_health_check():
    """ヘルスチェックのテスト"""
    logger.info("🔍 ヘルスチェックを実行中...")
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code == 200:
            logger.success(f"✅ ヘルスチェック成功 - ステータス: {response.status_code}")
            logger.info(f"📊 レスポンス: {response.json()}")
        else:
            logger.warning(f"⚠️ ヘルスチェック警告 - ステータス: {response.status_code}")
    except Exception as e:
        logger.error(f"❌ ヘルスチェックエラー: {e}")

def process_receipt_image(image_path: str, model: str = "gemini/gemini-2.5-flash", format: str = "xml"):
    """
    レシート画像を処理する
    
    Args:
        image_path: 画像ファイルのパス
        model: 使用するAIモデル
        format: 出力形式 (xml/csv)
    """
    image_file = Path(image_path)
    
    if not image_file.exists():
        logger.error(f"❌ 画像ファイルが見つかりません: {image_path}")
        return
    
    logger.info(f"📸 レシート画像を処理中: {image_file.name}")
    logger.info(f"🤖 使用モデル: {model}")
    logger.info(f"📄 出力形式: {format}")
    
    try:
        with open(image_file, 'rb') as f:
            files = {'file': (image_file.name, f, 'image/jpeg')}
            data = {
                'model': model,
                'format': format
            }
            
            logger.debug("🚀 APIリクエストを送信中...")
            response = requests.post(
                f"{API_BASE_URL}/process",
                files=files,
                data=data
            )
        
        if response.status_code == 200:
            result = response.json()
            if result['success']:
                logger.success("✅ 処理成功!")
                logger.info(f"📊 結果 ({result['format']} 形式):")
                print_separator("-", 50)
                
                # 結果データを見やすく表示
                data_lines = result['data'].split('\n')
                for line in data_lines[:3]:  # 最初の3行のみ表示
                    if line.strip():
                        logger.info(f"   {line}")
                if len(data_lines) > 3:
                    logger.info(f"   ... (残り {len(data_lines) - 3} 行)")
                
                print_separator("-", 50)
                
                # ファイルに保存
                output_file = f"output_{image_file.stem}.{format}"
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(result['data'])
                logger.success(f"💾 結果を保存しました: {output_file}")
            else:
                logger.error(f"❌ 処理エラー: {result['error']}")
        else:
            logger.error(f"❌ APIエラー: {response.status_code}")
            logger.debug(f"レスポンス詳細: {response.text}")
            
    except Exception as e:
        logger.error(f"❌ リクエストエラー: {e}")

def process_receipt_base64(image_path: str, model: str = "gemini/gemini-2.5-flash", format: str = "xml"):
    """
    BASE64エンコードでレシート画像を処理する（汎用的な方法）
    
    Args:
        image_path: 画像ファイルのパス
        model: 使用するAIモデル
        format: 出力形式 (xml/csv)
    """
    image_file = Path(image_path)
    
    if not image_file.exists():
        logger.error(f"❌ 画像ファイルが見つかりません: {image_path}")
        return
    
    logger.info(f"📸 レシート画像を処理中（BASE64）: {image_file.name}")
    logger.info(f"🤖 使用モデル: {model}")
    logger.info(f"📄 出力形式: {format}")
    
    try:
        # 画像をBASE64エンコード
        logger.debug("🔄 画像をBASE64エンコード中...")
        with open(image_file, 'rb') as f:
            image_data = f.read()
            image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        logger.debug(f"📏 BASE64データサイズ: {len(image_base64):,} 文字")
        
        # APIリクエスト
        request_data = {
            "image_base64": image_base64,
            "model": model,
            "format": format
        }
        
        logger.debug("🚀 BASE64 APIリクエストを送信中...")
        response = requests.post(
            f"{API_BASE_URL}/process_base64",
            json=request_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            if result['success']:
                logger.success("✅ 処理成功（BASE64）!")
                logger.info(f"📊 結果 ({result['format']} 形式):")
                print_separator("-", 50)
                
                # 結果データを見やすく表示
                data_lines = result['data'].split('\n')
                for line in data_lines[:3]:  # 最初の3行のみ表示
                    if line.strip():
                        logger.info(f"   {line}")
                if len(data_lines) > 3:
                    logger.info(f"   ... (残り {len(data_lines) - 3} 行)")
                
                print_separator("-", 50)
                
                # ファイルに保存
                output_file = f"output_base64_{image_file.stem}.{format}"
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(result['data'])
                logger.success(f"💾 結果を保存しました: {output_file}")
            else:
                logger.error(f"❌ 処理エラー: {result['error']}")
        else:
            logger.error(f"❌ APIエラー: {response.status_code}")
            logger.debug(f"レスポンス詳細: {response.text}")
            
    except Exception as e:
        logger.error(f"❌ リクエストエラー: {e}")

def main():
    """メイン関数"""
    logger.info("🚀 Harina v3 Fast API クライアントサンプル")
    print_separator("=", 60)
    
    # ヘルスチェック
    test_health_check()
    
    # サンプル画像のパス（ハードコード）
    image_path = Path(__file__).parent / "IMG_8923.jpg"
    
    if image_path.exists():
        logger.info(f"📁 使用する画像: {image_path.name}")
        
        print_section_header("ファイルアップロード方式")
        # XML形式で処理
        process_receipt_image(str(image_path), format="xml")
        print()
        
        # CSV形式で処理
        process_receipt_image(str(image_path), format="csv")
        
        print_section_header("BASE64方式（汎用的）")
        # BASE64方式でXML形式で処理
        process_receipt_base64(str(image_path), format="xml")
        print()
        
        # BASE64方式でCSV形式で処理
        process_receipt_base64(str(image_path), format="csv")
        
        # 異なるモデルで処理（環境変数でAPIキーが設定されている場合）
        # process_receipt_base64(str(image_path), model="gpt-4o", format="xml")
        
        print()
        logger.success("🎉 すべての処理が完了しました！")
        
    else:
        logger.error(f"❌ サンプル画像が見つかりません: {image_path}")
        logger.warning("⚠️ IMG_8923.jpg を src フォルダに配置してください")

if __name__ == "__main__":
    main()