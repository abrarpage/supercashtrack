-- Pairing Telegram via Chat.telegramChatId (tanpa user_telegram_link).

-- AlterTable
ALTER TABLE "chat" ADD COLUMN "telegramChatId" TEXT;

-- Backfill dari user_telegram_link jika ada (upgrade dari migrasi sebelumnya).
INSERT INTO "chat" ("id", "userId", "createdAt", "updatedAt", "telegramChatId")
SELECT gen_random_uuid()::text, utl."userId", utl."linkedAt", utl."updatedAt", utl."telegramChatId"
FROM "user_telegram_link" utl
WHERE NOT EXISTS (
  SELECT 1 FROM "chat" c WHERE c."telegramChatId" = utl."telegramChatId"
);

-- DropTable
DROP TABLE IF EXISTS "user_telegram_link";

-- DropEnum (tidak dipakai lagi)
DROP TYPE IF EXISTS "TelegramStatus";

-- CreateIndex
CREATE UNIQUE INDEX "chat_telegramChatId_key" ON "chat"("telegramChatId");
