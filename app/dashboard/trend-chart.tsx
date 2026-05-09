"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatIDR, formatNumberID } from "@/lib/format";

interface TrendDatum {
  month: string;
  label: string;
  income: number;
  expense: number;
}

export function TrendChart({ data }: { data: TrendDatum[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2b3139" />
          <XAxis
            dataKey="label"
            stroke="#707a8a"
            tick={{ fontSize: 12, fill: "#707a8a" }}
            tickLine={false}
            axisLine={{ stroke: "#2b3139" }}
          />
          <YAxis
            stroke="#707a8a"
            tick={{ fontSize: 11, fill: "#707a8a" }}
            tickFormatter={(v) => formatNumberID(typeof v === "number" ? v : Number(v))}
            tickLine={false}
            axisLine={{ stroke: "#2b3139" }}
            width={70}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              backgroundColor: "#1e2329",
              border: "1px solid #2b3139",
              borderRadius: 8,
              fontSize: 12,
              color: "#eaecef",
            }}
            formatter={(value, name) => [
              formatIDR(typeof value === "number" ? value : Number(value)),
              name === "income" ? "Pemasukan" : "Pengeluaran",
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#eaecef" }}
            formatter={(value) => (value === "income" ? "Pemasukan" : "Pengeluaran")}
          />
          <Bar dataKey="income" fill="#0ecb81" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="expense" fill="#f6465d" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
