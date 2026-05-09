"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Bot, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateShortID, formatIDR, formatMonthID } from "@/lib/format";
import { TrendChart } from "./trend-chart";
import { useApiAnyGet } from "@/services/client/crud";

type DashboardSummary = {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  topIncomeCategory: { name: string; total: number } | null;
  topExpenseCategory: { name: string; total: number } | null;
  monthlyTrend: { month: string; income: number; expense: number }[];
  recentTransactions: {
    id: string;
    type: "INCOME" | "EXPENSE";
    amount: string;
    note: string | null;
    source: "WEB" | "TELEGRAM";
    categoryName: string;
    occurredAt: string;
  }[];
};

export function DashboardPageContent() {
  const { data, isLoading } = useApiAnyGet("dashboard/summary");
  const summary = (data?.data ?? null) as DashboardSummary | null;

  if (isLoading || !summary) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted">
          Memuat ringkasan dashboard...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-strong">Dashboard</h1>
        <p className="text-sm text-muted">Ringkasan keuangan kamu dalam satu layar.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted">Saldo saat ini</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div
              className={
                "font-numeric text-3xl font-bold " +
                (summary.balance >= 0 ? "text-ink-strong" : "text-trading-down")
              }
            >
              {formatIDR(summary.balance)}
            </div>
            <p className="mt-1 text-xs text-muted">Pemasukan dikurangi pengeluaran</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted">Total pemasukan</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-trading-up" />
          </CardHeader>
          <CardContent>
            <div className="font-numeric text-3xl font-bold text-trading-up">
              {formatIDR(summary.totalIncome)}
            </div>
            <p className="mt-1 text-xs text-muted">Sepanjang waktu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted">Total pengeluaran</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-trading-down" />
          </CardHeader>
          <CardContent>
            <div className="font-numeric text-3xl font-bold text-trading-down">
              {formatIDR(summary.totalExpense)}
            </div>
            <p className="mt-1 text-xs text-muted">Sepanjang waktu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted">Kategori pemasukan teratas</CardTitle>
            <TrendingUp className="h-4 w-4 text-trading-up" />
          </CardHeader>
          <CardContent>
            {summary.topIncomeCategory ? (
              <>
                <div className="text-lg font-semibold text-ink-strong">
                  {summary.topIncomeCategory.name}
                </div>
                <div className="font-numeric mt-1 text-sm text-trading-up">
                  {formatIDR(summary.topIncomeCategory.total)}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">Belum ada data.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted">Kategori pengeluaran teratas</CardTitle>
            <TrendingDown className="h-4 w-4 text-trading-down" />
          </CardHeader>
          <CardContent>
            {summary.topExpenseCategory ? (
              <>
                <div className="text-lg font-semibold text-ink-strong">
                  {summary.topExpenseCategory.name}
                </div>
                <div className="font-numeric mt-1 text-sm text-trading-down">
                  {formatIDR(summary.topExpenseCategory.total)}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">Belum ada data.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/40 bg-primary/5">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted">Tip</CardTitle>
            <Bot className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ink">
              Catat lebih cepat lewat Telegram. Hubungkan akun di halaman{" "}
              <Link href="/dashboard/integrations" className="text-primary underline">
                Integrasi
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tren 6 bulan terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart
            data={summary.monthlyTrend.map((m) => ({
              ...m,
              label: formatMonthID(`${m.month}-01`),
            }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Transaksi terbaru</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/transactions">Lihat semua →</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {summary.recentTransactions.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-muted">
              Belum ada transaksi. Mulai catat lewat web atau Telegram.
            </div>
          ) : (
            <div className="divide-y divide-hairline">
              {summary.recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-4 px-6 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-ink-strong truncate">
                      {t.note ?? "(tanpa catatan)"}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                      <Badge variant={t.type === "INCOME" ? "income" : "expense"}>
                        {t.categoryName}
                      </Badge>
                      <span>{formatDateShortID(t.occurredAt)}</span>
                      {t.source === "TELEGRAM" && <span className="text-primary">· Telegram</span>}
                    </div>
                  </div>
                  <div
                    className={
                      "font-numeric whitespace-nowrap font-semibold " +
                      (t.type === "INCOME" ? "text-trading-up" : "text-trading-down")
                    }
                  >
                    {t.type === "INCOME" ? "+" : "−"}
                    {formatIDR(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
