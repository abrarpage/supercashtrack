// Smoke test untuk parser pesan Telegram.
// Jalankan: bun run telegram:test-parse
import { parseTelegramMessage } from "@/lib/telegram/parse";

const cases: { input: string; description: string }[] = [
  { input: "/start", description: "command /start" },
  { input: "/saldo", description: "command /saldo" },
  { input: "/bantuan@CashTrackerBot", description: "command dengan @bot" },
  { input: "CT-8F29XQ", description: "account ID valid" },
  { input: "CT-INVALID", description: "account ID invalid (huruf I,1)" },
  { input: "15000 beli es krim", description: "expense kategori kata pertama" },
  { input: "+500000 gaji freelance", description: "income kategori kata pertama" },
  {
    input: "15000 beli es krim #makan",
    description: "expense kategori dari hashtag pertama (#makan)",
  },
  {
    input: "+500000 gaji freelance #gaji",
    description: "income kategori dari hashtag (#gaji), catatan tanpa token hashtag",
  },
  { input: "15000 #makan", description: "expense hanya nominal + hashtag (tanpa catatan)" },
  { input: "15000#makan", description: "nominal langsung menempel hashtag" },
  { input: "+800000 #gaji bonus thr", description: "income hashtag di awal sisa teks" },
  { input: "15.000 beli kopi", description: "angka dengan titik ribuan" },
  { input: "1.234.567 motor", description: "angka besar dengan titik ribuan" },
  { input: "15,5 ribu", description: "angka desimal koma" },
  { input: "1.234,56 transfer", description: "format Indo lengkap" },
  { input: "halo bot", description: "bukan transaksi" },
  { input: "  ", description: "whitespace doang" },
  { input: "", description: "kosong" },
];

console.log("Smoke test: parser pesan Telegram\n");
for (const c of cases) {
  const result = parseTelegramMessage(c.input);
  console.log(`◆ ${c.description}`);
  console.log(`  input  : ${JSON.stringify(c.input)}`);
  console.log(`  output : ${JSON.stringify(result)}`);
  console.log();
}
