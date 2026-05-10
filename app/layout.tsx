import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import QueryProvider from "@/components/QueryProvider";
import { getSiteUrl, siteConfig } from "@/lib/config";

const siteUrl = getSiteUrl();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SuperCashTrack | Catat keuangan lewat Telegram",
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "supercashtrack",
    "catat keuangan",
    "pencatatan keuangan",
    "telegram",
    "pemasukan pengeluaran",
    "budget",
    "uang harian",
    "finansial pribadi",
    "indonesia",
  ],
  authors: [{ name: `${siteConfig.name} Team` }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName: siteConfig.name,
    title: "SuperCashTrack | Catat keuangan lewat Telegram",
    description: siteConfig.description,
    images: [
      {
        url: `${siteUrl}${siteConfig.ogImage}`,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — catat keuangan lewat Telegram`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SuperCashTrack | Catat keuangan lewat Telegram",
    description: siteConfig.description,
    images: [`${siteUrl}${siteConfig.ogImage}`],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-canvas text-ink flex flex-col">
        <SessionProvider>
          <QueryProvider>
            {children}
            <Toaster
              position="top-right"
              theme="dark"
              richColors
              toastOptions={{
                style: {
                  background: "var(--surface-elevated)",
                  color: "var(--ink)",
                  border: "1px solid var(--hairline)",
                },
              }}
            />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
