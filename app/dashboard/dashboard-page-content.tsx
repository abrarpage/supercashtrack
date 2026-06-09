"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Bot, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { formatDateShortID, formatIDR, formatMonthID } from "@/lib/format";
import { TrendChart } from "./trend-chart";
import { CategoryPieChart } from "./category-pie-chart";
import { useApiAnyGet } from "@/services/client/crud";

type DashboardSummary = {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  topIncomeCategory: { name: string; total: number } | null;
  topExpenseCategory: { name: string; total: number } | null;
  monthlyTrend: { month: string; income: number; expense: number }[];
  expenseByCategory: { name: string; total: number }[];
  incomeByCategory: { name: string; total: number }[];
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

type RangeKind = "all" | "month" | "year" | "custom";

const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function DashboardPageContent() {
  const now = new Date();
  const [rangeKind, setRangeKind] = useState<RangeKind>("month");
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);
  const [pieType, setPieType] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  const queryParams = useMemo(() => {
    if (rangeKind === "all") return { range: "all" };
    if (rangeKind === "year") return { range: "year", year };
    if (rangeKind === "custom") {
      if (!customRange?.from) return { range: "all" };
      const from = new Date(customRange.from);
      from.setHours(0, 0, 0, 0);
      const toDate = customRange.to ?? customRange.from;
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      return { range: "custom", from: from.toISOString(), to: to.toISOString() };
    }
    return { range: "month", year, month };
  }, [rangeKind, year, month, customRange]);

  const { data, isLoading } = useApiAnyGet("dashboard/summary", { queryParams });
  const summary = (data?.data ?? null) as DashboardSummary | null;

  const yearOptions = useMemo(() => {
    const ys: number[] = [];
    for (let y = now.getFullYear(); y >= now.getFullYear() - 5; y--) ys.push(y);
    return ys;
  }, [now]);

  const periodLabel = useMemo(() => {
    if (rangeKind === "all") return "Sepanjang waktu";
    if (rangeKind === "year") return `Tahun ${year}`;
    if (rangeKind === "custom") {
      if (!customRange?.from) return "Pilih rentang tanggal";
      const fmtD = (d: Date) => format(d, "d MMM yyyy", { locale: localeId });
      if (customRange.to && customRange.from.toDateString() !== customRange.to.toDateString()) {
        return `${fmtD(customRange.from)} – ${fmtD(customRange.to)}`;
      }
      return fmtD(customRange.from);
    }
    return `${MONTH_NAMES_ID[month - 1]} ${year}`;
  }, [rangeKind, year, month, customRange]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-strong">Dashboard</h1>
          <p className="text-sm text-muted">Ringkasan keuangan kamu dalam satu layar.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={rangeKind} onValueChange={(v) => setRangeKind(v as RangeKind)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Bulan</SelectItem>
              <SelectItem value="year">Tahun</SelectItem>
              <SelectItem value="custom">Kustom</SelectItem>
              <SelectItem value="all">Sepanjang waktu</SelectItem>
            </SelectContent>
          </Select>

          {rangeKind === "month" && (
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_NAMES_ID.map((name, idx) => (
                  <SelectItem key={idx + 1} value={String(idx + 1)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {(rangeKind === "month" || rangeKind === "year") && (
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {rangeKind === "custom" && (
            <DateRangePicker
              value={customRange}
              onChange={setCustomRange}
              align="end"
              className="w-[260px]"
              placeholder="Pilih rentang"
            />
          )}
        </div>
      </div>

      {isLoading || !summary ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted">
            Memuat ringkasan dashboard...
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-muted">Saldo</CardTitle>
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
                <p className="mt-1 text-xs text-muted">{periodLabel}</p>
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
                <p className="mt-1 text-xs text-muted">{periodLabel}</p>
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
                <p className="mt-1 text-xs text-muted">{periodLabel}</p>
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
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">
                Komposisi {pieType === "EXPENSE" ? "pengeluaran" : "pemasukan"} per kategori
              </CardTitle>
              <Select
                value={pieType}
                onValueChange={(v) => setPieType(v as "EXPENSE" | "INCOME")}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                  <SelectItem value="INCOME">Pemasukan</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <CategoryPieChart
                data={
                  pieType === "EXPENSE" ? summary.expenseByCategory : summary.incomeByCategory
                }
              />
              <p className="mt-2 text-xs text-muted">{periodLabel}</p>
            </CardContent>
          </Card>

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
                          {t.source === "TELEGRAM" && (
                            <span className="text-primary">· Telegram</span>
                          )}
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
        </>
      )}
    </div>
  );
}
