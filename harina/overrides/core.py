"""Harina v3 - Receipt OCR using Gemini API via LiteLLM (overridden)."""

import os
from pathlib import Path
from typing import List, Optional

import litellm
from loguru import logger
from PIL import Image

from .utils import (
    image_to_base64,
    extract_xml,
    format_xml,
    convert_xml_to_csv
)
from .category_sync import get_categories_xml


class HarinaCore:
    """Receipt OCR processor using Gemini API via LiteLLM."""

    def __init__(
        self,
        model_name: str = "gemini/gemini-2.5-flash",
        template_path: Optional[str] = None,
        categories_path: Optional[str] = None
    ):
        self.model_name = model_name
        self.template_path = template_path
        self.categories_path = categories_path
        self.last_used_fallback = False
        self.last_used_key_label: Optional[str] = None

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
        try:
            categories_xml = get_categories_xml()
            if categories_xml:
                return categories_xml
        except Exception as exc:  # pragma: no cover - defensive logging
            logger.warning("Falling back to static category XML due to error: {}", exc)

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
            response = self._run_completion_with_fallback(messages)

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

    def _gemini_key_candidates(self) -> List[tuple[str, Optional[str]]]:
        if not self.model_name.lower().startswith("gemini"):
            return [("other", None)]

        candidates: List[tuple[str, Optional[str]]] = []
        free_key = os.getenv("GEMINI_API_KEY_FREE")
        main_key = os.getenv("GEMINI_API_KEY")

        if free_key:
            candidates.append(("free", free_key))
        if main_key:
            candidates.append(("primary", main_key))

        if not candidates:
            candidates.append(("primary", None))

        return candidates

    def _run_completion_with_fallback(self, messages):
        self.last_used_fallback = False
        self.last_used_key_label = None
        candidates = self._gemini_key_candidates()
        last_error: Optional[Exception] = None
        fallback_used_any = False

        for index, (label, candidate) in enumerate(candidates):
            try:
                kwargs = {"model": self.model_name, "messages": messages}
                if candidate:
                    kwargs["api_key"] = candidate
                response = litellm.completion(**kwargs)
                self.last_used_fallback = fallback_used_any
                self.last_used_key_label = label
                return response
            except Exception as exc:  # noqa: BLE001
                last_error = exc
                error_message = str(exc).lower()
                has_additional_candidate = len(candidates) > index + 1
                should_retry = (
                    label == "free"
                    and has_additional_candidate
                    and candidate is not None
                    and "quota" in error_message
                )

                if should_retry:
                    logger.warning("⚠️ GEMINI_API_KEY_FREE quota exhausted, retrying with GEMINI_API_KEY")
                    fallback_used_any = True
                    continue
                raise

        if last_error:
            self.last_used_fallback = fallback_used_any
            if not self.last_used_key_label and fallback_used_any:
                self.last_used_key_label = "primary"
            raise last_error
        if self.last_used_key_label is None:
            self.last_used_key_label = "primary" if self.model_name.lower().startswith("gemini") else "other"
        raise RuntimeError("Failed to obtain completion response")
