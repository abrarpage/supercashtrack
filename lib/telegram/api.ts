// Client kecil untuk panggilan Telegram Bot API (sendMessage).
import { TELEGRAM_API_BASE } from "@/lib/constants";

function token() {
  return process.env.TELEGRAM_BOT_TOKEN ?? "";
}

export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
): Promise<void> {
  const t = token();

  if (!t) {
    console.warn("[telegram] TELEGRAM_BOT_TOKEN tidak diset, skip kirim pesan");
    return;
  }
  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/bot${t}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      // fetch tidak throw pada 4xx/5xx → perlu dicatat agar mudah debug.
      const body = await res.text().catch(() => "");
      console.error(
        `[telegram] sendMessage gagal (${res.status}) chatId=${String(chatId)}: ${body}`,
      );
    }
  } catch (err) {
    console.error("[telegram] gagal kirim pesan:", err);
  }
}
