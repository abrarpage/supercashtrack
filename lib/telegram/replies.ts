// Pesan-pesan balasan bot Telegram, semua dalam Bahasa Indonesia.
import { formatIDR, formatDateID } from "@/lib/format";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export const REPLY_WELCOME = `Halo! Selamat datang di Cash Tracker Bot.
Silakan masukkan Account ID kamu untuk menghubungkan akun.
Contoh: CT-8F29XQ`;

export const REPLY_WELCOME_BACK = (firstName?: string | null) =>
  `Halo${firstName ? `, ${firstName}` : ""}! Akun kamu sudah terhubung.

Sekarang kamu bisa langsung mencatat transaksi tanpa menulis Account ID lagi:
<code>15000 beli kopi #makan</code>
(<code>#makan</code> = kategori; bisa juga tanpa hashtag: <code>15000 makan beli kopi</code>)

Kalau kamu ingin ganti akun (re-pair), cukup kirim Account ID lagi, atau pakai prefix satu baris:
<code>CT-8F29XQ 15000 beli kopi #makan</code>

Ketik /bantuan untuk daftar perintah.`;

export const REPLY_LINK_INVALID = `Account ID tidak ditemukan.
Pastikan format kamu benar: CT-XXXXXX (contoh: CT-8F29XQ).
Account ID bisa kamu lihat di halaman "Account ID" pada dashboard.`;

export const REPLY_LINK_ALREADY_USED = `Account ID ini sudah dihubungkan ke akun Telegram lain.
Silakan putuskan dulu di dashboard, atau hubungi pemilik akun.`;

export const REPLY_LINK_SUCCESS = (publicId: string) =>
  `✅ Berhasil terhubung ke akun <code>${publicId}</code>.

Sekarang kamu bisa langsung mencatat transaksi:
<pre>15000 beli kopi #makan</pre>

Kalau ingin ganti akun (re-pair), kirim Account ID lagi, atau pakai prefix:
<pre>${publicId} 15000 beli kopi #makan</pre>

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
• Pengeluaran : <code>15000 beli es krim #makan</code> atau <code>15000 makan beli es krim</code>
• Pemasukan  : <code>+800000 #gaji</code> atau <code>+500000 gaji freelance</code>

Ketik /bantuan untuk daftar perintah.`;

export const REPLY_HELP = `📋 Daftar perintah:
/start — sambutan & status koneksi
/saldo — lihat saldo
/harini — lihat transaksi hari ini & total bulan ini
/bantuan — tampilkan pesan ini
/putuskan — putuskan koneksi

Format mencatat transaksi:
• <code>15000 beli es krim #makan</code> → pengeluaran (kategori dari <code>#makan</code>)
• <code>15000 makan beli es krim</code> → pengeluaran (kategori kata pertama: <code>makan</code>)
• <code>+800000 #gaji</code> → pemasukan; kategori baru dari hashtag dibuat otomatis jika belum ada
• <code>+500000 gaji freelance</code> → pemasukan (tanpa hashtag)

Ganti akun (re-pair) kapan saja:
• Kirim Account ID saja: <code>CT-8F29XQ</code>
• Atau prefix: <code>CT-8F29XQ 15000 beli kopi #makan</code>`;

export type TelegramTxItem = {
  type: "INCOME" | "EXPENSE";
  amount: number;
  note: string | null;
  categoryName: string;
  occurredAt: Date;
};

export type TelegramTxSummary = {
  today: TelegramTxItem[];
  monthIncome: number;
  monthExpense: number;
};

/** Ringkasan transaksi: list hari ini + total bulan ini. */
export function formatTransactionsAppendix(summary: TelegramTxSummary): string {
  const income = summary.today.filter((t) => t.type === "INCOME");
  const expense = summary.today.filter((t) => t.type === "EXPENSE");

  const renderItem = (t: TelegramTxItem) => {
    const note = t.note?.trim() ? escapeHtml(t.note.trim()) : escapeHtml(t.categoryName);
    return `• ${formatIDR(t.amount)} — ${note} <i>(${escapeHtml(t.categoryName)})</i>`;
  };

  const incomeBlock =
    income.length > 0
      ? `📥 <b>Pemasukan hari ini</b>\n${income.map(renderItem).join("\n")}`
      : `📥 <b>Pemasukan hari ini</b>: belum ada.`;

  const expenseBlock =
    expense.length > 0
      ? `📤 <b>Pengeluaran hari ini</b>\n${expense.map(renderItem).join("\n")}`
      : `📤 <b>Pengeluaran hari ini</b>: belum ada.`;

  const totals = `📊 <b>Total bulan ini</b>\nPemasukan  : ${formatIDR(summary.monthIncome)}\nPengeluaran: ${formatIDR(summary.monthExpense)}`;

  return `\n\n---\n${incomeBlock}\n\n${expenseBlock}\n\n---\n${totals}`;
}

export const REPLY_TODAY_HEADER = `🗓️ <b>Ringkasan hari ini</b>`;

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
  const title = isIncome ? "✅ Pemasukan berhasil dicatat!" : "✅ Pengeluaran berhasil dicatat!";
  const tanggal = formatDateID(args.occurredAt);
  const jumlah = formatIDR(args.amount);
  const catatan = escapeHtml(args.note ?? "(tanpa catatan)");
  const kategori = escapeHtml(args.categoryName);
  return `${title}
Tanggal  : ${tanggal}
Jumlah   : ${jumlah}
Catatan  : ${catatan}
Kategori : ${kategori}`;
}

export function replyBalance(args: { balance: number; income: number; expense: number }): string {
  return `💰 <b>Saldo kamu</b>
Saldo saat ini : <b>${formatIDR(args.balance)}</b>
Total pemasukan : ${formatIDR(args.income)}
Total pengeluaran: ${formatIDR(args.expense)}`;
}
