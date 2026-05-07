// Default categories yang otomatis di-seed saat user pertama kali daftar.
import type { TxType } from "./generated/prisma/enums";

export const DEFAULT_EXPENSE_CATEGORIES = [
  "Makan",
  "Transportasi",
  "Belanja",
  "Lainnya",
];

export const DEFAULT_INCOME_CATEGORIES = [
  "Gaji",
  "Freelance",
  "Bonus",

  "Lainnya",
];

export const FALLBACK_CATEGORY_NAME = "Lainnya";

export const PUBLIC_ID_PREFIX = "CT-";
export const PUBLIC_ID_LENGTH = 6;

export const TELEGRAM_API_BASE = "https://api.telegram.org";

export type CategorySeed = { name: string; type: TxType };

export const ALL_DEFAULT_CATEGORIES: CategorySeed[] = [
  ...DEFAULT_EXPENSE_CATEGORIES.map((name) => ({
    name,
    type: "EXPENSE" as TxType,
  })),
  ...DEFAULT_INCOME_CATEGORIES.map((name) => ({
    name,
    type: "INCOME" as TxType,
  })),
];
