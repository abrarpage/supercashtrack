# Cash Tracker

Aplikasi pencatat keuangan pribadi dengan integrasi bot Telegram. Catat
pemasukan dan pengeluaran kamu secepat mengetik chat — semua antarmuka dan
balasan bot dalam Bahasa Indonesia.

## Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Bahasa**: TypeScript (strict)
- **ORM**: Prisma 7 (`prisma-client` generator + `@prisma/adapter-pg`)
- **Database**: PostgreSQL
- **Auth**: Auth.js v5 (Google OAuth, JWT session, Prisma adapter)
- **UI**: shadcn-style components di atas Radix UI + Tailwind CSS v4
- **Validasi**: Zod
- **Bot**: Telegram Bot API (webhook-based)

## Struktur direktori

```
app/
  layout.tsx                  Root layout (font, Toaster)
  page.tsx                    Landing
  login/page.tsx              Halaman login (Google)
  dashboard/                  UI utama (protected)
    layout.tsx
    page.tsx                  Dashboard ringkasan
    transactions/             List + filter + dialog form
    categories/               Kelola kategori
    integrations/             Telegram integration
    account-id/               Tampil & salin Account ID
    settings/                 Profil + zona waktu + mata uang
  api/
    auth/[...nextauth]/route.ts
    categories/{route.ts,[id]/route.ts}
    transactions/{route.ts,[id]/route.ts}
    dashboard/summary/route.ts
    integrations/telegram/route.ts
    settings/route.ts
    telegram/webhook/route.ts  -- Endpoint webhook Telegram
auth.ts                       Konfigurasi NextAuth (events, callbacks)
proxy.ts                      Next.js 16 Proxy (middleware) -- guard /dashboard
prisma/
  schema.prisma               Skema (provider postgres; URL via prisma.config.ts)
prisma.config.ts              DATABASE_URL dari env
lib/
  prisma.ts                   Singleton PrismaClient + PrismaPg adapter
  auth-helpers.ts             requireUser, getSessionUser
  format.ts                   formatIDR / formatDateID (locale id-ID)
  public-id.ts                Generate & validasi format CT-XXXXXX
  summary.ts                  Agregasi dashboard
  validations/                Schema Zod (category, transaction, settings)
  telegram/
    parse.ts                  Parse pesan -> command/account_id/transaction
    handler.ts                Logika utama bot (pairing, perintah, transaksi)
    api.ts                    sendMessage
    replies.ts                Semua teks balasan (Bahasa Indonesia)
    types.ts                  Subset Telegram Update types
components/
  ui/                         Button, Card, Dialog, Select, Input, dst.
  layout/                     Sidebar, Topbar, MobileNav
  confirm-dialog.tsx
scripts/
  test-parse.ts               Smoke test parser Telegram
```

## Setup

### 1. Install

```bash
bun install
```

### 2. Environment

Salin `.env.example` ke `.env` dan isi:

```bash
cp .env.example .env
```

Variabel wajib:

| Variabel                  | Keterangan                                                   |
| ------------------------- | ------------------------------------------------------------ |
| `DATABASE_URL`            | Connection string PostgreSQL (dipakai Prisma & adapter `pg`) |
| `AUTH_SECRET`             | Generate: `openssl rand -base64 32`                          |
| `AUTH_GOOGLE_ID`          | Google OAuth client ID                                       |
| `AUTH_GOOGLE_SECRET`      | Google OAuth client secret                                   |
| `TELEGRAM_BOT_TOKEN`      | Token dari [@BotFather](https://t.me/BotFather)              |
| `TELEGRAM_WEBHOOK_SECRET` | String acak untuk verifikasi header webhook                  |
| `NEXTAUTH_URL`            | URL aplikasi (mis. `http://localhost:3000` saat dev)         |

Authorized redirect URI Google:
`http://localhost:3000/api/auth/callback/google`

### 3. Database

```bash
bun run db:migrate           # buat dan apply migration
bun run db:studio            # opsional: GUI Prisma
```

> **Prisma 7 catatan:** URL koneksi tinggal di `prisma.config.ts` (lewat env),
> tidak lagi di `schema.prisma`. Runtime client dibangun dengan
> `@prisma/adapter-pg` di `lib/prisma.ts`.

### 4. Jalankan

```bash
bun run dev          # localhost:3000
```

Login dengan Google. Saat akun dibuat pertama kali, Auth.js event `createUser`
otomatis:

- Generate `publicId` format `CT-XXXXXX`
- Seed kategori default (Makan, Transportasi, ..., Gaji, Freelance, ...)

## Telegram bot setup

### 1. Buat bot

Chat ke [@BotFather](https://t.me/BotFather), kirim `/newbot`, simpan token.

### 2. Daftarkan webhook

Cash Tracker menggunakan webhook (bukan polling). Daftarkan dengan:

```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://YOUR_DOMAIN/api/telegram/webhook",
    "secret_token": "<TELEGRAM_WEBHOOK_SECRET>",
    "allowed_updates": ["message", "edited_message"]
  }'
```

Verifikasi:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

> Untuk dev lokal, expose port 3000 lewat `ngrok` atau `cloudflared` lalu pakai
> URL HTTPS-nya. Telegram tidak memanggil webhook ke alamat HTTP biasa.

### 3. Hubungkan akun

1. Buka bot, kirim `/start`.
2. Bot meminta Account ID. Salin dari `/dashboard/account-id`.
3. Setelah terhubung, kirim transaksi:
   - Pengeluaran: `15000 beli es krim`
   - Pemasukan: `+500000 gaji freelance`
   - Dengan kategori: `15000 beli es krim #makan`

### Daftar perintah bot

| Command     | Fungsi                                    |
| ----------- | ----------------------------------------- |
| `/start`    | Sambutan + status koneksi                 |
| `/saldo`    | Saldo, total pemasukan, total pengeluaran |
| `/bantuan`  | Daftar perintah & format input            |
| `/putuskan` | Putuskan akun Telegram dari Cash Tracker  |

## Smoke test parser

```bash
bun run telegram:test-parse
```

Menguji 16 kasus parser (command, account ID, transaksi dengan/tanpa hashtag,
angka format Indonesia 1.234,56 dst.).

## Build

```bash
bun run build
bun run start
```

## Catatan implementasi

- **Dedup webhook** — `TelegramMessageLog` punya
  `@@unique([telegramChatId, telegramMessageId])`. Setiap update di-create
  dulu; jika konflik (P2002) -> sudah pernah diproses, return langsung.
- **Respons cepat** — webhook handler memanggil `void handleTelegramUpdate(...)`
  tanpa `await` agar HTTP 200 keluar dalam < 200ms. Trade-off: di serverless
  platform tertentu function bisa berhenti sebelum promise selesai;
  pertimbangkan queue (BullMQ / SQS / Trigger.dev) untuk produksi.
- **Format mata uang** — `Intl.NumberFormat("id-ID", { currency: "IDR" })`
  menghasilkan "Rp 15.000" sesuai konvensi Bahasa Indonesia.
- **Format tanggal** — `date-fns` dengan locale `id` -> "Senin, 1 Mei 2026".
- **Hashtag -> kategori** — Jika hashtag tidak cocok kategori existing,
  kategori baru dibuat otomatis (case-insensitive, di-title-case-kan).
- **Proxy (Next.js 16)** — file `proxy.ts` (bukan `middleware.ts`) memakai
  helper `auth(...)` dari NextAuth v5; melindungi semua `/dashboard/*`.
- **Prisma client output** — keluar di `lib/generated/prisma/` (sengaja di luar
  `app/` agar tidak di-scan sebagai routes). Folder ini di-gitignore.
