import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Bot,
  ListChecks,
  PieChart,
  ShieldCheck,
} from "lucide-react";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top nav */}
      <header className="border-b border-hairline">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-on-primary font-bold">
              ¢
            </div>
            <span className="text-lg font-bold tracking-tight text-primary">
              CASH TRACKER
            </span>
          </div>
          <Button asChild size="pill">
            <Link href="/login">Masuk</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
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
                Cukup kirim &ldquo;15000 beli es krim&rdquo; ke bot Telegram —
                kami yang catat. Lihat rekap, kategori, dan tren pengeluaran
                kamu langsung dari dashboard.
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
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <div className="text-ink">{row.note}</div>
                        <div className="text-xs text-muted">{row.cat}</div>
                      </div>
                      <div
                        className={
                          "font-numeric font-medium " +
                          (row.kind === "income"
                            ? "text-trading-up"
                            : "text-trading-down")
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
          <div className="mx-auto max-w-6xl px-6 py-20">
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
                <div
                  key={i}
                  className="rounded-xl border border-hairline bg-surface-card p-6"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/15 text-primary [&_svg]:size-5">
                    {f.icon}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-ink-strong">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted md:flex-row">
          <span>© 2026 Cash Tracker. Dibuat dengan teliti.</span>
          <span>Catatan keuanganmu, di ujung jari.</span>
        </div>
      </footer>
    </div>
  );
}
