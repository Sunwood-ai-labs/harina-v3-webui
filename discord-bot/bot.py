import logging
import os
from typing import Optional, Dict

import aiohttp
import discord
import discord.abc

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("receipt.discord.bot")

DISCORD_TOKEN = os.getenv("DISCORD_BOT_TOKEN")
if not DISCORD_TOKEN:
    raise RuntimeError("環境変数 DISCORD_BOT_TOKEN が設定されていません。")

RECEIPT_API_URL = os.getenv("RECEIPT_API_URL", "http://app:3000/api/process-receipt")
DEFAULT_MODEL = os.getenv("RECEIPT_MODEL", "gemini")
DEFAULT_UPLOADER = os.getenv("RECEIPT_UPLOADER", "discord")
RECEIPT_BASE_URL = os.getenv("DISCORD_RECEIPT_BASE_URL", "").rstrip("/")
ALLOWED_CHANNEL_IDS = {
    int(cid)
    for cid in os.getenv("DISCORD_ALLOWED_CHANNEL_IDS", "").split(",")
    if cid.strip().isdigit()
}
MAX_FILE_SIZE_MB = float(os.getenv("DISCORD_MAX_FILE_MB", "15"))
MAX_FILE_BYTES = int(MAX_FILE_SIZE_MB * 1024 * 1024)


def parse_channel_uploaders(raw_mapping: str) -> Dict[str, str]:
    mapping: Dict[str, str] = {}
    for item in raw_mapping.split(","):
        if not item.strip() or ":" not in item:
            continue
        channel, uploader = item.split(":", 1)
        channel_key = channel.strip().lower()
        uploader_value = uploader.strip()
        if channel_key and uploader_value:
            mapping[channel_key] = uploader_value
    return mapping


CHANNEL_UPLOADERS = parse_channel_uploaders(os.getenv("DISCORD_CHANNEL_UPLOADERS", ""))


def build_receipt_url(receipt_id_value: Optional[object]) -> Optional[str]:
    if not RECEIPT_BASE_URL:
        return None

    try:
        receipt_id_int = int(receipt_id_value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None

    if receipt_id_int <= 0:
        return None

    return f"{RECEIPT_BASE_URL}/receipts/{receipt_id_int}"

intents = discord.Intents.default()
intents.message_content = True


def build_result_message(payload: dict) -> str:
    lines = [
        "✅ レシート処理が完了しました",
    ]

    store = payload.get("store_name")
    if store:
        lines.append(f"店舗: {store}")

    total = payload.get("total_amount")
    if total is not None:
        lines.append(f"合計金額: {total}")

    fallback_used = payload.get("fallbackUsed")
    key_type = payload.get("keyType")

    emoji = None
    if fallback_used:
        emoji = "🔁"
    elif key_type == "free":
        emoji = "🆓"
    elif key_type == "primary":
        emoji = "🔑"

    if emoji:
        lines[0] = f"{lines[0]} {emoji}"

    if fallback_used:
        lines.append("🔁 Gemini FREEキーから本命キーへスイッチして解析したよ！")
    elif key_type == "free":
        lines.append("🆓 Gemini FREEキーで解析したよ〜！")
    elif key_type == "primary":
        lines.append("🔑 Gemini 本命キーでしっかり処理したよ！")

    items = payload.get("items") or []
    if items:
        top_items = items[:5]
        lines.append("--- アイテム一覧 (最大5件) ---")
        for item in top_items:
            name = item.get("name", "不明な商品")
            price = item.get("total_price")
            if price is None:
                lines.append(f"• {name}")
            else:
                lines.append(f"• {name}: {price}")

    receipt_url = build_receipt_url(payload.get("id"))
    if receipt_url:
        lines.append("---")
        lines.append(f"🔗 {receipt_url}")

    return "\n".join(lines)


async def send_receipt_to_api(
    session: aiohttp.ClientSession,
    file_bytes: bytes,
    filename: str,
    content_type: Optional[str] = None,
    uploader: Optional[str] = None,
) -> dict:
    form = aiohttp.FormData()
    form.add_field(
        name="file",
        value=file_bytes,
        filename=filename,
        content_type=content_type or "application/octet-stream",
    )
    form.add_field("model", DEFAULT_MODEL)
    form.add_field("uploader", uploader or DEFAULT_UPLOADER)

    async with session.post(RECEIPT_API_URL, data=form) as resp:
        if resp.status >= 400:
            text = await resp.text()
            raise RuntimeError(f"APIエラー: {resp.status} {text}")
        return await resp.json()


class ResponseThread(discord.abc.Messageable):
    def __init__(self, channel: discord.abc.Messageable, thread: Optional[discord.Thread] = None):
        self.channel = channel
        self.thread = thread

    def is_thread(self) -> bool:
        return self.thread is not None

    async def send(self, *args, **kwargs):
        return await self.channel.send(*args, **kwargs)

    async def close(self) -> None:
        if self.thread and not self.thread.locked:
            try:
                await self.thread.edit(locked=True, archived=True)
            except discord.HTTPException as exc:
                logger.warning("スレッドのクローズに失敗しました: %s", exc)


async def ensure_response_thread(message: discord.Message) -> ResponseThread:
    channel = message.channel

    if isinstance(channel, discord.Thread):
        return ResponseThread(channel, channel)

    if isinstance(channel, discord.TextChannel):
        thread_name = f"receipt-{message.id}"
        try:
            thread = await message.create_thread(name=thread_name, auto_archive_duration=60)
            return ResponseThread(thread, thread)
        except discord.HTTPException as exc:
            logger.warning("スレッド作成に失敗しました: %s", exc)
            return ResponseThread(channel)

    return ResponseThread(channel)


class ReceiptBot(discord.Client):
    def __init__(self, **options):
        super().__init__(**options)
        self.http_session: Optional[aiohttp.ClientSession] = None

    async def setup_hook(self) -> None:
        self.http_session = aiohttp.ClientSession()
        logger.info("Discord bot is ready. Waiting for attachments...")

    async def close(self) -> None:
        if self.http_session and not self.http_session.closed:
            await self.http_session.close()
        await super().close()

    async def on_ready(self):
        logger.info("Logged in as %s (ID: %s)", self.user, self.user.id)

    async def on_message(self, message: discord.Message):
        if message.author.bot:
            return

        if ALLOWED_CHANNEL_IDS and message.channel.id not in ALLOWED_CHANNEL_IDS:
            return

        uploader_override = self._resolve_uploader(message)

        image_attachments = [
            att
            for att in message.attachments
            if (att.content_type and att.content_type.startswith("image/"))
            or att.filename.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"))
        ]

        if not image_attachments:
            return

        if not self.http_session:
            await message.reply("⚠️ HTTPセッションが初期化されていません。", mention_author=False)
            return

        response_channel = await ensure_response_thread(message)
        for attachment in image_attachments:
            if attachment.size and attachment.size > MAX_FILE_BYTES:
                await response_channel.send(
                    f"⚠️ `{attachment.filename}` は大きすぎます (最大 {MAX_FILE_SIZE_MB}MB まで)。"
                )
                continue

            status_msg = await response_channel.send(
                f"📸 `{attachment.filename}` を処理しています…"
            )

            try:
                file_bytes = await attachment.read()
                if not file_bytes:
                    raise RuntimeError("添付ファイルの内容が空でした")

                content_type = attachment.content_type
                result = await send_receipt_to_api(
                    self.http_session,
                    file_bytes,
                    attachment.filename,
                    content_type,
                    uploader_override,
                )
                response_msg = build_result_message(result)
                await status_msg.edit(content=response_msg)
            except Exception as exc:  # pylint: disable=broad-except
                logger.exception("画像処理に失敗しました")
                await status_msg.edit(content=f"❌ `{attachment.filename}` の処理に失敗しました: {exc}")

        await response_channel.close()

    def _resolve_uploader(self, message: discord.Message) -> Optional[str]:
        channel_name = None

        if isinstance(message.channel, discord.Thread):
            if message.channel.parent:
                channel_name = message.channel.parent.name
            else:
                channel_name = message.channel.name
        elif hasattr(message.channel, "name"):
            channel_name = message.channel.name

        if channel_name:
            uploader = CHANNEL_UPLOADERS.get(channel_name.lower())
            if uploader:
                return uploader

        return None


def main():
    bot = ReceiptBot(intents=intents)
    bot.run(DISCORD_TOKEN)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        pass
