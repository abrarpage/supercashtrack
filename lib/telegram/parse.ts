// Parser pesan masuk Telegram menjadi: transaksi, command, account-id, atau unknown.
import { isValidPublicIdFormat, normalizePublicId } from "@/lib/public-id";
import type { ParsedInput } from "./types";

const COMMAND_PREFIX = "/";

function isHashtagToken(token: string): boolean {
  return token.startsWith("#") && token.length > 1;
}

/** First line valid CT-XXXXXX → pairing / verification prefix; rest is payload. */
export function splitLeadingPublicId(text: string): {
  publicId: string | null;
  rest: string;
} {
  const trimmed = text.trim();
  if (!trimmed) return { publicId: null, rest: "" };

  const nl = trimmed.indexOf("\n");
  const firstLine = nl === -1 ? trimmed : trimmed.slice(0, nl).trim();
  const afterFirst = nl === -1 ? "" : trimmed.slice(nl + 1);

  if (isValidPublicIdFormat(firstLine)) {
    return {
      publicId: normalizePublicId(firstLine),
      rest: afterFirst.trim(),
    };
  }

  // Satu baris: CT-XXX diikuti spasi + perintah/transaksi
  const tokens = trimmed.split(/\s+/);
  if (tokens.length >= 2 && isValidPublicIdFormat(tokens[0] ?? "")) {
    return {
      publicId: normalizePublicId(tokens[0] ?? ""),
      rest: tokens.slice(1).join(" ").trim(),
    };
  }

  return { publicId: null, rest: trimmed };
}

export function parseTelegramMessage(text: string): ParsedInput {
  const trimmed = text.trim();
  if (!trimmed) return { kind: "unknown" };

  // 1) Command — diawali "/"
  if (trimmed.startsWith(COMMAND_PREFIX)) {
    const [first, ...rest] = trimmed.slice(1).split(/\s+/);
    const cmd = (first ?? "").toLowerCase().split("@")[0]; // /start@MyBot → start
    return {
      kind: "command",
      command: cmd,
      args: rest.join(" ").trim(),
    };
  }

  // 2) Account ID — format CT-XXXXXX
  if (isValidPublicIdFormat(trimmed)) {
    return {
      kind: "account_id",
      publicId: normalizePublicId(trimmed),
    };
  }

  // 3) Transaksi — diawali angka atau tanda "+"
  // Regex: tangkap optional "+", lalu angka.
  // Bentuk angka: grouped (≥1 pemisah ribuan) ATAU plain digits dengan optional desimal.
  // Grouped form harus didahulukan dan WAJIB punya pemisah, jadi "15000" jatuh ke plain form.
  const transactionRegex =
    /^(?<sign>\+)?(?<num>\d{1,3}(?:[.,]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?)\s*(?<rest>.*)$/u;
  const match = transactionRegex.exec(trimmed);
  if (match && match.groups) {
    const { sign, num, rest } = match.groups as {
      sign?: string;
      num: string;
      rest: string;
    };
    const amount = parseAmount(num);
    if (!Number.isFinite(amount) || amount <= 0) return { kind: "unknown" };

    // `${nominal} …` — jika ada `#tag`, itu kategori; kalau tidak, token pertama = kategori.
    const restTrimmed = (rest ?? "").trim();
    const tokens = restTrimmed.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return { kind: "unknown" };

    const hashIdx = tokens.findIndex(isHashtagToken);
    let categoryRaw: string;
    let note: string | null;
    let categorySource: "hashtag" | "plain";

    if (hashIdx !== -1) {
      categoryRaw = tokens[hashIdx].slice(1);
      if (!categoryRaw) return { kind: "unknown" };
      const noteParts = [...tokens.slice(0, hashIdx), ...tokens.slice(hashIdx + 1)];
      note = noteParts.join(" ").trim() || null;
      categorySource = "hashtag";
    } else {
      const [first, ...descParts] = tokens;
      categoryRaw = first!;
      note = descParts.join(" ").trim() || null;
      categorySource = "plain";
    }

    return {
      kind: "transaction",
      type: sign === "+" ? "INCOME" : "EXPENSE",
      amount,
      category: categoryRaw,
      note,
      categorySource,
    };
  }

  return { kind: "unknown" };
}

// "15.000" → 15000, "15,5" → 15.5, "1.234,56" → 1234.56
function parseAmount(raw: string): number {
  const hasDot = raw.includes(".");
  const hasComma = raw.includes(",");

  if (hasDot && hasComma) {
    // Format Indonesia: titik = ribuan, koma = desimal
    return Number(raw.replace(/\./g, "").replace(",", "."));
  }
  if (hasComma && !hasDot) {
    // Koma = desimal
    return Number(raw.replace(",", "."));
  }
  if (hasDot && !hasComma) {
    // Heuristik: jika ada lebih dari 1 titik ATAU posisinya pas pemisah ribuan,
    // anggap pemisah ribuan. Contoh: 15.000, 1.234.567
    const parts = raw.split(".");
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      return Number(raw.replace(/\./g, ""));
    }
    return Number(raw);
  }
  return Number(raw);
}
