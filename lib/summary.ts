// Helper agregasi ringkasan keuangan untuk dashboard.
import { prisma } from "@/lib/prisma";

export interface DashboardSummary {
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
    occurredAt: string;
    categoryName: string;
  }[];
}

export async function getDashboardSummary(
  userId: string,
): Promise<DashboardSummary> {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [grouped, topByCat, recent, trendRows] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["type"],
      where: { userId },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId", "type"],
      where: { userId },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { occurredAt: "desc" },
      take: 10,
    }),
    prisma.transaction.findMany({
      where: { userId, occurredAt: { gte: sixMonthsAgo } },
      select: { type: true, amount: true, occurredAt: true },
    }),
  ]);

  const totalIncome = Number(
    grouped.find((g) => g.type === "INCOME")?._sum.amount ?? 0,
  );
  const totalExpense = Number(
    grouped.find((g) => g.type === "EXPENSE")?._sum.amount ?? 0,
  );

  // Top categories
  const categoryIds = topByCat.map((g) => g.categoryId);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });
  const catName = new Map(categories.map((c) => [c.id, c.name]));

  let topIncome: { name: string; total: number } | null = null;
  let topExpense: { name: string; total: number } | null = null;
  for (const row of topByCat) {
    const total = Number(row._sum.amount ?? 0);
    const name = catName.get(row.categoryId) ?? "—";
    if (row.type === "INCOME") {
      if (!topIncome || total > topIncome.total) {
        topIncome = { name, total };
      }
    } else if (row.type === "EXPENSE") {
      if (!topExpense || total > topExpense.total) {
        topExpense = { name, total };
      }
    }
  }

  // Monthly trend (6 bulan terakhir, termasuk bulan ini)
  const monthlyMap = new Map<
    string,
    { income: number; expense: number }
  >();
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
    balance: totalIncome - totalExpense,
    totalIncome,
    totalExpense,
    topIncomeCategory: topIncome,
    topExpenseCategory: topExpense,
    monthlyTrend,
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
