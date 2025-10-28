"""Harina v3 - Receipt OCR using Gemini API via LiteLLM (overridden)."""

from pathlib import Path
from typing import Optional

import litellm
from loguru import logger
from PIL import Image

from .utils import (
    image_to_base64,
    extract_xml,
    format_xml,
    convert_xml_to_csv
)


class HarinaCore:
    """Receipt OCR processor using Gemini API via LiteLLM."""

    def __init__(
        self,
        model_name: str = "gemini/gemini-1.5-flash",
        template_path: Optional[str] = None,
        categories_path: Optional[str] = None
    ):
        self.model_name = model_name
        self.template_path = template_path
        self.categories_path = categories_path

    def _load_xml_template(self) -> str:
        if self.template_path:
            template_path = Path(self.template_path)
        else:
            template_path = Path(__file__).parent / "receipt_template.xml"
        try:
            return template_path.read_text(encoding='utf-8')
        except Exception as exc:
            raise ValueError(f"Failed to load XML template: {exc}") from exc

    def _load_product_categories(self) -> str:
        if self.categories_path:
            categories_path = Path(self.categories_path)
        else:
            categories_path = Path(__file__).parent / "product_categories.xml"
        try:
            return categories_path.read_text(encoding='utf-8')
        except Exception as exc:
            raise ValueError(f"Failed to load product categories: {exc}") from exc

    def process_receipt(
        self,
        image_path: Path,
        output_format: str = 'xml',
        additional_instructions: Optional[str] = None
    ) -> str:
        logger.debug(f"📂 Loading image: {image_path}")
        try:
            image = Image.open(image_path)
            logger.debug(f"✅ Image loaded successfully: {image.size} pixels, mode: {image.mode}")
        except Exception as exc:
            logger.error(f"❌ Failed to load image: {exc}")
            raise ValueError(f"Failed to load image: {exc}") from exc

        logger.debug("🔄 Converting image to base64...")
        image_base64 = image_to_base64(image)
        logger.debug(f"✅ Image converted to base64 ({len(image_base64)} characters)")

        logger.debug("📋 Loading XML template and product categories...")
        xml_template = self._load_xml_template()
        product_categories = self._load_product_categories()
        logger.debug("✅ Templates loaded successfully")

        prompt_sections = []

        sanitized_instructions = additional_instructions.strip() if additional_instructions else ""

        if sanitized_instructions:
            prompt_sections.extend([
                "以下の追加指示を厳密に守ってください：",
                sanitized_instructions,
                "",
            ])

        prompt_sections.extend([
            "このレシート画像を分析して、以下のXML形式で情報を抽出してください：",
            "",
            xml_template,
            "",
            "商品のカテゴリ分けには以下の分類を参考にしてください：",
            "",
            product_categories,
            "",
            "各商品について、最も適切なカテゴリとサブカテゴリを選択してください。",
            "情報が読み取れない場合は、該当する要素を空にするか省略してください。",
            "数値は数字のみで出力し、通貨記号は含めないでください。",
            "XMLタグのみを出力し、他の説明文は含めないでください。"
        ])

        prompt = "\n".join(prompt_sections)

        logger.info("🧾 Final prompt sent to LLM:\n{}", prompt)

        try:
            messages = [
                # populated below
            ]

            if sanitized_instructions:
                messages.append({
                    "role": "system",
                    "content": [
                        {
                            "type": "text",
                            "text": f"追加指示：{sanitized_instructions}"
                        }
                    ]
                })

            messages.append({
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_base64}"
                        }
                    }
                ]
            })

            logger.info("🤖 Preparing API request...")
            response = litellm.completion(
                model=self.model_name,
                messages=messages
            )

            if not response.choices or not response.choices[0].message.content:
                logger.error("❌ No response from API")
                raise ValueError("No response from Gemini API")

            response_text = response.choices[0].message.content
            logger.info("✅ Received response from API")

            logger.info("🔍 Extracting XML content from response...")
            xml_content = extract_xml(response_text)
            logger.debug("✅ XML content extracted successfully")

            logger.info("📝 Formatting and validating XML...")
            formatted_xml = format_xml(xml_content)
            logger.info("✅ XML formatted and validated successfully")

            if output_format.lower() == 'csv':
                return convert_xml_to_csv(formatted_xml)
            return formatted_xml

        except Exception as exc:
            logger.error(f"❌ Failed to process receipt: {exc}")
            raise RuntimeError(f"Failed to process receipt: {exc}") from exc
