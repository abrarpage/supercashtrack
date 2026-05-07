// Pesan-pesan balasan bot Telegram, semua dalam Bahasa Indonesia.
import { formatIDR, formatDateID } from "@/lib/format";

export const REPLY_WELCOME = `Halo! Selamat datang di Cash Tracker Bot.
Silakan masukkan Account ID kamu untuk menghubungkan akun.
Contoh: CT-8F29XQ`;

export const REPLY_WELCOME_BACK = (firstName?: string | null) =>
  `Halo${firstName ? `, ${firstName}` : ""}! Akun kamu sudah terhubung.

Sekarang kamu bisa langsung mencatat transaksi tanpa menulis Account ID lagi:
<pre>15000 beli es krim</pre>

Kalau kamu ingin ganti akun (re-pair), cukup kirim Account ID lagi, atau pakai prefix satu baris:
<pre>CT-8F29XQ 15000 beli es krim</pre>

Ketik /bantuan untuk daftar perintah.`;

export const REPLY_LINK_INVALID = `Account ID tidak ditemukan.
Pastikan format kamu benar: CT-XXXXXX (contoh: CT-8F29XQ).
Account ID bisa kamu lihat di halaman "Account ID" pada dashboard.`;

export const REPLY_LINK_ALREADY_USED = `Account ID ini sudah dihubungkan ke akun Telegram lain.
Silakan putuskan dulu di dashboard, atau hubungi pemilik akun.`;

export const REPLY_LINK_SUCCESS = (publicId: string) =>
  `✅ Berhasil terhubung ke akun <code>${publicId}</code>.

Sekarang kamu bisa langsung mencatat transaksi:
<pre>15000 beli es krim</pre>

Kalau ingin ganti akun (re-pair), kirim Account ID lagi, atau pakai prefix:
<pre>${publicId} 15000 beli es krim</pre>

Ketik /bantuan untuk daftar perintah.`;

export const REPLY_NEED_ACCOUNT_ID = `Akun kamu belum terhubung.
Kirim Account ID kamu untuk mulai (contoh: CT-8F29XQ).
Account ID bisa dilihat di halaman "Account ID" pada dashboard Cash Tracker.`;

export const REPLY_SEND_ACCOUNT_ID_FIRST = `Wajib sertakan <b>Account ID</b> dengan benar:
• Kirim <b>Account ID saja</b> (satu baris) untuk menghubungkan pertama kali, atau
• Pakai prefix satu baris: <code>CT-8F29XQ 15000 beli kopi</code> / <code>CT-8F29XQ /saldo</code>

Hubungkan dulu dengan mengirim hanya Account ID (satu baris) jika belum pernah.`;

export const REPLY_ACCOUNT_ID_MISMATCH_OR_NOT_LINKED = `Account ID tidak cocok dengan akun Telegram ini, atau akun belum dihubungkan.
Pastikan kamu sudah mengirim Account ID saja (satu baris) untuk menghubungkan, lalu gunakan baris pertama yang sama untuk setiap transaksi.`;

export const REPLY_UNKNOWN_FORMAT = `Format tidak dikenali.
Contoh format:
• Pengeluaran : <code>15000 makan beli es krim</code>
• Pemasukan  : <code>+500000 gaji freelance</code>

Ketik /bantuan untuk daftar perintah.`;

export const REPLY_HELP = `📋 Daftar perintah:
/start — sambutan & status koneksi
/saldo — lihat saldo
/bantuan — tampilkan pesan ini
/putuskan — putuskan koneksi

Format mencatat transaksi:
• <code>15000 makan beli es krim</code> → pengeluaran
• <code>+500000 gaji freelance</code> → pemasukan
• Bentuk: <code>{nominal} {category} {deskripsi}</code> (category 1 kata)

Ganti akun (re-pair) kapan saja:
• Kirim Account ID saja: <code>CT-8F29XQ</code>
• Atau prefix: <code>CT-8F29XQ 15000 makan beli kopi</code>`;

export type TelegramChatSummary = {
  id: string;
  messages: { content: string; senderType: string; timestamp: Date }[];
};

/** Riwayat chat aplikasi (model Chat/Message), sudah difilter per akun. */
export function formatFilteredChatAppendix(
  chats: TelegramChatSummary[],
): string {
  const flat = chats.flatMap((c) =>
    c.messages.map((m) => ({
      chatId: c.id,
      ...m,
    })),
  );
  flat.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const take = flat.slice(0, 8);
  if (take.length === 0) {
    return `\n\n---\n📜 <b>Riwayat chat aplikasi</b>: belum ada pesan tersimpan.`;
  }
  const lines = take.map((m) => {
    const t = formatDateID(m.timestamp);
    const short =
      m.content.length > 120 ? `${m.content.slice(0, 117)}…` : m.content;
    return `• ${t} · ${m.senderType}: ${short}`;
  });
  return `\n\n---\n📜 <b>Riwayat chat aplikasi</b> (akun ini saja):\n${lines.join("\n")}`;
}

export const REPLY_DISCONNECTED = `🔌 Akun Telegram kamu telah diputuskan dari Cash Tracker.
Kamu bisa hubungkan lagi kapan saja dengan mengirim Account ID.`;

export const REPLY_NOT_LINKED_FOR_DISCONNECT = `Akun kamu belum terhubung — tidak ada yang perlu diputuskan.`;

export function replyTransactionRecorded(args: {
  type: "INCOME" | "EXPENSE";
  amount: number;
  note: string | null;
  categoryName: string;
  occurredAt: Date;
}): string {
  const isIncome = args.type === "INCOME";
  const title = isIncome
    ? "✅ Pemasukan berhasil dicatat!"
    : "✅ Pengeluaran berhasil dicatat!";
  const tanggal = formatDateID(args.occurredAt);
  const jumlah = formatIDR(args.amount);
  const catatan = args.note ?? "(tanpa catatan)";
  return `${title}
Tanggal  : ${tanggal}
Jumlah   : ${jumlah}
Catatan  : ${catatan}
Kategori : ${args.categoryName}`;
}

export function replyBalance(args: {
  balance: number;
  income: number;
  expense: number;
}): string {
  return `💰 <b>Saldo kamu</b>
Saldo saat ini : <b>${formatIDR(args.balance)}</b>
Total pemasukan : ${formatIDR(args.income)}
Total pengeluaran: ${formatIDR(args.expense)}`;
}
