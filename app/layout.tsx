import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import QueryProvider from "@/components/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cash Tracker — Catat keuangan lewat Telegram",
  description:
    "Lacak pemasukan dan pengeluaran kamu lewat Telegram. Cepat, sederhana, dan rapi.",
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
