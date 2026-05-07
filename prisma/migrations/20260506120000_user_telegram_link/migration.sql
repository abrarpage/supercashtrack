-- CreateTable
CREATE TABLE "user_telegram_link" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "telegramChatId" TEXT NOT NULL,
    "telegramUserId" TEXT,
    "telegramUsername" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "status" "TelegramStatus" NOT NULL DEFAULT 'CONNECTED',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_telegram_link_pkey" PRIMARY KEY ("id")
);

-- Migrate existing Telegram fields from user (satu link per user, jadi primary)
INSERT INTO "user_telegram_link" (
    "id",
    "userId",
    "telegramChatId",
    "telegramUserId",
    "telegramUsername",
    "firstName",
    "lastName",
    "status",
    "isPrimary",
    "linkedAt",
    "updatedAt"
)
SELECT
    gen_random_uuid()::text,
    u."id",
    u."telegramChatId",
    u."telegramUserId",
    u."telegramUsername",
    u."telegramFirstName",
    u."telegramLastName",
    COALESCE(u."telegramStatus", 'CONNECTED'::"TelegramStatus"),
    true,
    COALESCE(u."telegramLinkedAt", u."updatedAt"),
    u."updatedAt"
FROM "user" u
WHERE u."telegramChatId" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_telegram_link_telegramChatId_key" ON "user_telegram_link"("telegramChatId");

-- CreateIndex
CREATE INDEX "user_telegram_link_userId_idx" ON "user_telegram_link"("userId");

-- AddForeignKey
ALTER TABLE "user_telegram_link" ADD CONSTRAINT "user_telegram_link_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey (none on telegram cols)

-- DropIndex
DROP INDEX IF EXISTS "user_telegramChatId_key";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "telegramChatId";
ALTER TABLE "user" DROP COLUMN "telegramUserId";
ALTER TABLE "user" DROP COLUMN "telegramUsername";
ALTER TABLE "user" DROP COLUMN "telegramFirstName";
ALTER TABLE "user" DROP COLUMN "telegramLastName";
ALTER TABLE "user" DROP COLUMN "telegramStatus";
ALTER TABLE "user" DROP COLUMN "telegramLinkedAt";
