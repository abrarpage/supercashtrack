// Helper agregasi ringkasan keuangan untuk dashboard.
import { prisma } from "@/lib/prisma";

export type SummaryRange =
  | { kind: "all" }
  | { kind: "month"; year: number; month: number } // month: 1-12
  | { kind: "year"; year: number }
  | { kind: "custom"; from: Date; to: Date };

export interface DashboardSummary {
  range: SummaryRange;
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
    occurredAt: string;
    categoryName: string;
  }[];
}

function rangeToDateFilter(range: SummaryRange): { gte?: Date; lt?: Date } {
  if (range.kind === "all") return {};
  if (range.kind === "month") {
    const gte = new Date(range.year, range.month - 1, 1);
    const lt = new Date(range.year, range.month, 1);
    return { gte, lt };
  }
  if (range.kind === "year") {
    const gte = new Date(range.year, 0, 1);
    const lt = new Date(range.year + 1, 0, 1);
    return { gte, lt };
  }
  return { gte: range.from, lt: range.to };
}

export function parseRangeFromQuery(params: URLSearchParams): SummaryRange {
  const kind = params.get("range") ?? "month";
  const now = new Date();
  if (kind === "all") return { kind: "all" };
  if (kind === "custom") {
    const fromStr = params.get("from");
    const toStr = params.get("to");
    if (fromStr && toStr) {
      const from = new Date(fromStr);
      const to = new Date(toStr);
      if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime())) {
        return { kind: "custom", from, to };
      }
    }
    return { kind: "all" };
  }
  if (kind === "year") {
    const year = Number(params.get("year")) || now.getFullYear();
    return { kind: "year", year };
  }
  const year = Number(params.get("year")) || now.getFullYear();
  const month = Number(params.get("month")) || now.getMonth() + 1;
  return { kind: "month", year, month };
}

export async function getDashboardSummary(
  userId: string,
  range: SummaryRange = { kind: "all" },
): Promise<DashboardSummary> {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const dateFilter = rangeToDateFilter(range);
  const occurredAtFilter =
    Object.keys(dateFilter).length > 0 ? { occurredAt: dateFilter } : {};

  const [grouped, topByCat, recent, trendRows] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["type"],
      where: { userId, ...occurredAtFilter },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId", "type"],
      where: { userId, ...occurredAtFilter },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { userId, ...occurredAtFilter },
      include: { category: true },
      orderBy: { occurredAt: "desc" },
      take: 10,
    }),
    prisma.transaction.findMany({
      where: { userId, occurredAt: { gte: sixMonthsAgo } },
      select: { type: true, amount: true, occurredAt: true },
    }),
  ]);

  const totalIncome = Number(grouped.find((g) => g.type === "INCOME")?._sum.amount ?? 0);
  const totalExpense = Number(grouped.find((g) => g.type === "EXPENSE")?._sum.amount ?? 0);

  // Top categories + breakdown for pie
  const categoryIds = topByCat.map((g) => g.categoryId);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });
  const catName = new Map(categories.map((c) => [c.id, c.name]));

  let topIncome: { name: string; total: number } | null = null;
  let topExpense: { name: string; total: number } | null = null;
  const incomeByCategory: { name: string; total: number }[] = [];
  const expenseByCategory: { name: string; total: number }[] = [];
  for (const row of topByCat) {
    const total = Number(row._sum.amount ?? 0);
    if (total <= 0) continue;
    const name = catName.get(row.categoryId) ?? "—";
    if (row.type === "INCOME") {
      incomeByCategory.push({ name, total });
      if (!topIncome || total > topIncome.total) topIncome = { name, total };
    } else if (row.type === "EXPENSE") {
      expenseByCategory.push({ name, total });
      if (!topExpense || total > topExpense.total) topExpense = { name, total };
    }
  }
  incomeByCategory.sort((a, b) => b.total - a.total);
  expenseByCategory.sort((a, b) => b.total - a.total);

  // Monthly trend (6 bulan terakhir, termasuk bulan ini) — independent of filter
  const monthlyMap = new Map<string, { income: number; expense: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, { income: 0, expense: 0 });
  }
  for (const r of trendRows) {
    const d = new Date(r.occurredAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const slot = monthlyMap.get(key);
    if (!slot) continue;
    if (r.type === "INCOME") slot.income += Number(r.amount);
    else slot.expense += Number(r.amount);
  }
  const monthlyTrend = Array.from(monthlyMap.entries()).map(([month, v]) => ({
    month,
    income: v.income,
    expense: v.expense,
  }));

  return {
    range,
    balance: totalIncome - totalExpense,
    totalIncome,
    totalExpense,
    topIncomeCategory: topIncome,
    topExpenseCategory: topExpense,
    monthlyTrend,
    expenseByCategory,
    incomeByCategory,
    recentTransactions: recent.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount.toString(),
      note: t.note,
      source: t.source,
      occurredAt: t.occurredAt.toISOString(),
      categoryName: t.category.name,
    })),
  };
}
