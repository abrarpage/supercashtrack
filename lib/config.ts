export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3001";
}

export const siteConfig = {
  name: "SuperCashTrack",
  description: "Lacak pemasukan dan pengeluaran kamu lewat Telegram. Cepat, sederhana, dan rapi.",
  ogImage: "/og-image.png",
};
