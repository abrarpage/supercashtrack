import Link from "next/link";
import { Button } from "@/components/ui/button";

import { ArrowRight, Bot, ListChecks, PieChart, ShieldCheck } from "lucide-react";
import { generateMetadata as genMeta } from "@/lib/seo";
import PublicHeader from "@/components/layout/PublicHeader";
import PublicFooter from "@/components/layout/PublicFooter";

export const metadata = genMeta({
  title: "SuperCashTrack | Catat keuangan lewat Telegram",
  description:
    "SuperCashTrack membantu kamu mencatat pemasukan dan pengeluaran langsung dari Telegram. Ringkas, otomatis terklasifikasi, dan mudah dipantau dari dashboard web.",
  keywords: [
    "supercashtrack",
    "catat keuangan telegram",
    "pencatatan keuangan",
    "pemasukan pengeluaran",
    "budget harian",
    "finansial pribadi",
    "indonesia",
  ],
  url: "/",
});

export default async function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Top nav */}
      <PublicHeader />

      {/* Hero */}
      <section className="flex-1">
        <div className="mx-auto wrapper py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-hairline bg-surface-card px-3 py-1 text-xs text-muted">
                <span className="h-2 w-2 rounded-full bg-trading-up" />
                Catat keuangan dari mana saja, lewat Telegram
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-ink-strong md:text-6xl">
                Lacak pemasukan & pengeluaran kamu{" "}
                <span className="text-primary">secepat mengetik chat.</span>
              </h1>
              <p className="max-w-xl text-base text-muted md:text-lg">
                Cukup kirim &ldquo;15000 beli es krim&rdquo; ke bot Telegram — kami yang catat.
                Lihat rekap, kategori, dan tren pengeluaran kamu langsung dari dashboard.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="pill">
                  <Link href="/login">
                    Mulai gratis
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="pill" variant="secondary">
                  <Link href="#fitur">Pelajari fitur</Link>
                </Button>
              </div>
            </div>

            {/* Right: mock dashboard card */}
            <div className="relative">
              <div className="rounded-xl border border-hairline bg-surface-card p-6">
                <div className="flex items-center justify-between border-b border-hairline pb-4">
                  <span className="text-xs uppercase tracking-wider text-muted">
                    Saldo saat ini
                  </span>
                  <span className="text-xs text-muted">Mei 2026</span>
                </div>
                <div className="font-numeric mt-4 text-4xl font-bold text-ink-strong">
                  Rp 4.250.000
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-hairline bg-surface-elevated p-3">
                    <div className="text-xs text-muted">Pemasukan</div>
                    <div className="font-numeric mt-1 text-lg font-semibold text-trading-up">
                      Rp 6.000.000
                    </div>
                  </div>
                  <div className="rounded-lg border border-hairline bg-surface-elevated p-3">
                    <div className="text-xs text-muted">Pengeluaran</div>
                    <div className="font-numeric mt-1 text-lg font-semibold text-trading-down">
                      Rp 1.750.000
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  {[
                    {
                      note: "beli es krim",
                      cat: "Makan",
                      amount: "−Rp 15.000",
                      kind: "expense",
                    },
                    {
                      note: "gaji freelance",
                      cat: "Gaji",
                      amount: "+Rp 500.000",
                      kind: "income",
                    },
                    {
                      note: "bensin motor",
                      cat: "Transportasi",
                      amount: "−Rp 50.000",
                      kind: "expense",
                    },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div>
                        <div className="text-ink">{row.note}</div>
                        <div className="text-xs text-muted">{row.cat}</div>
                      </div>
                      <div
                        className={
                          "font-numeric font-medium " +
                          (row.kind === "income" ? "text-trading-up" : "text-trading-down")
                        }
                      >
                        {row.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div id="fitur" className="border-t border-hairline bg-surface-card/40">
          <div className="mx-auto wrapper py-20">
            <h2 className="text-center text-3xl font-bold text-ink-strong">
              Sederhana. Cepat. Terstruktur.
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: <Bot />,
                  title: "Catat lewat Telegram",
                  desc: "Kirim angka + catatan ke bot. Otomatis tersimpan dalam hitungan detik.",
                },
                {
                  icon: <PieChart />,
                  title: "Dashboard ringkas",
                  desc: "Saldo, total pemasukan, pengeluaran, dan kategori teratas dalam satu layar.",
                },
                {
                  icon: <ListChecks />,
                  title: "Kategori fleksibel",
                  desc: "Pakai default atau bikin kategori sendiri dengan #hashtag dari Telegram.",
                },
                {
                  icon: <ShieldCheck />,
                  title: "Akun aman",
                  desc: "Login lewat Google. Account ID rahasia khusus untuk hubungkan ke Telegram.",
                },
              ].map((f, i) => (
                <div key={i} className="rounded-xl border border-hairline bg-surface-card p-6">
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/15 text-primary [&_svg]:size-5">
                    {f.icon}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-ink-strong">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
