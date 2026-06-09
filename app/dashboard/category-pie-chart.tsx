"use client";

import { useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from "chart.js";
import { Pie } from "react-chartjs-2";
import { formatIDR } from "@/lib/format";

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = [
  "#f6465d",
  "#0ecb81",
  "#f0b90b",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#22d3ee",
  "#fb923c",
  "#84cc16",
  "#64748b",
];

interface Datum {
  name: string;
  total: number;
}

export function CategoryPieChart({ data }: { data: Datum[] }) {
  const chartData = useMemo(
    () => ({
      labels: data.map((d) => d.name),
      datasets: [
        {
          data: data.map((d) => d.total),
          backgroundColor: data.map((_, i) => PALETTE[i % PALETTE.length]),
          borderColor: "#1e2329",
          borderWidth: 2,
        },
      ],
    }),
    [data],
  );

  const options = useMemo<ChartOptions<"pie">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: { color: "#eaecef", font: { size: 12 }, boxWidth: 12 },
        },
        tooltip: {
          backgroundColor: "#1e2329",
          borderColor: "#2b3139",
          borderWidth: 1,
          titleColor: "#eaecef",
          bodyColor: "#eaecef",
          callbacks: {
            label: (ctx) => {
              const value = typeof ctx.raw === "number" ? ctx.raw : Number(ctx.raw);
              const total = ctx.dataset.data.reduce(
                (a: number, b) => a + (typeof b === "number" ? b : 0),
                0,
              );
              const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
              return `${ctx.label}: ${formatIDR(value)} (${pct}%)`;
            },
          },
        },
      },
    }),
    [],
  );

  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-muted">
        Belum ada data untuk periode ini.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <Pie data={chartData} options={options} />
    </div>
  );
}
