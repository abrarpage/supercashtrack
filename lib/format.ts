// Helper format Bahasa Indonesia (IDR + tanggal).
import { format as formatDate } from "date-fns";
import { id as localeId } from "date-fns/locale";

const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const idrNumberFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

export function formatIDR(amount: number | string | bigint): string {
  const value = typeof amount === "string" ? Number(amount) : Number(amount);
  if (!Number.isFinite(value)) return "Rp 0";
  return idrFormatter.format(value).replace(/ /g, " ");
}

export function formatNumberID(amount: number | string | bigint): string {
  const value = typeof amount === "string" ? Number(amount) : Number(amount);
  if (!Number.isFinite(value)) return "0";
  return idrNumberFormatter.format(value);
}

export function formatDateID(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDate(d, "EEEE, d MMMM yyyy", { locale: localeId });
}

export function formatDateShortID(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDate(d, "d MMM yyyy", { locale: localeId });
}

export function formatMonthID(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDate(d, "MMM yyyy", { locale: localeId });
}
