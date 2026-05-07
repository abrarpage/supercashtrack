// Jalankan: bun run telegram:set-webhook
// Otomatis terpanggil setelah build via script "postbuild".

import "dotenv/config";

type TelegramResponseOk = { ok: true; result: unknown };
type TelegramResponseErr = { ok: false; description?: string; error_code?: number };

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing env: ${name}`);
  }
  return v;
}

function parseAllowedUpdates(raw: string | undefined): string[] {
  // Default mengikuti kebutuhan user (message + edited_message)
  if (!raw) return ["message", "edited_message"];

  // Mendukung format:
  // - JSON array: ["message","edited_message"]
  // - CSV: message,edited_message
  const trimmed = raw.trim();
  if (!trimmed) return ["message", "edited_message"];

  if (trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) return parsed;
    throw new Error("TELEGRAM_ALLOWED_UPDATES must be JSON array of strings");
  }

  return trimmed
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main() {
  const botToken = requiredEnv("TELEGRAM_BOT_TOKEN");
  const NgrokUrl = requiredEnv("NGROK_URL");
  const secretToken = requiredEnv("TELEGRAM_WEBHOOK_SECRET");
  const isDevelopment = process.env.NODE_ENV === "development";
  const allowedUpdates = parseAllowedUpdates(process.env.TELEGRAM_ALLOWED_UPDATES);
const finalWebhookUrl=`${isDevelopment ? NgrokUrl : process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`;
  const endpoint = `https://api.telegram.org/bot${botToken}/setWebhook`;
  const body = {
    url: finalWebhookUrl,
    secret_token: secretToken,
    allowed_updates: allowedUpdates,
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as TelegramResponseOk | TelegramResponseErr;
  if (!res.ok || !json.ok) {
    const details =
      typeof (json as TelegramResponseErr).description === "string"
        ? (json as TelegramResponseErr).description
        : `HTTP ${res.status}`;
    throw new Error(`Telegram setWebhook failed: ${details}`);
  }

  console.log("Telegram webhook set successfully.");
  console.log(`url=${finalWebhookUrl}`);
  console.log(`allowed_updates=${JSON.stringify(allowedUpdates)}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

