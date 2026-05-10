// Webhook Telegram. Selalu balas 200 secepat mungkin agar Telegram tidak retry.
// Pemrosesan dilakukan async setelah respons di-flush.
import { NextResponse } from "next/server";
import { handleTelegramUpdate } from "@/lib/telegram/handler";
import type { TelegramUpdate } from "@/lib/telegram/types";

// Selalu jalankan dinamis, jangan di-cache.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Validasi secret token (jika diset)
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expectedSecret) {
    const got = request.headers.get("x-telegram-bot-api-secret-token");
    if (got !== expectedSecret) {
      console.log("secret not found");
      
      // Pelanggar webhook secret — tetap balas 200 agar tidak ada info bocor.
      return NextResponse.json({ ok: true });
    }
    
  }

  let body: TelegramUpdate | null = null;
  try {
    body = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = body?.message ?? body?.edited_message;

  if (!message) {
    console.log("message not found");
    
    return NextResponse.json({ ok: true });
  }

  try {
    await handleTelegramUpdate(message);
  } catch (err) {
    console.error("[telegram] gagal proses update:", err);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Telegram webhook endpoint. Use POST.",
  });
}
