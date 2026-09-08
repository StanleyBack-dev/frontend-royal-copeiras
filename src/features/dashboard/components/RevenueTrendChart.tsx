import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RevenueTrendPoint } from "../model/aggregations";

function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatCurrencyShort(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return String(value);
}

const SERIES_LABELS: Record<string, string> = {
  bruto: "Faturamento bruto",
  liquido: "Faturamento líquido",
};

export default function RevenueTrendChart({
  data,
}: {
  data: RevenueTrendPoint[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8d5c9" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "#7a4430" }}
          axisLine={{ stroke: "#e8d5c9" }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatCurrencyShort}
          tick={{ fontSize: 12, fill: "#7a4430" }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          formatter={(value, name) => [
            formatCurrencyFull(Number(value ?? 0)),
            SERIES_LABELS[String(name)] ?? String(name),
          ]}
          labelStyle={{ color: "#2c1810", fontWeight: 600 }}
          contentStyle={{ borderRadius: 12, borderColor: "#e8d5c9" }}
        />
        <Legend
          formatter={(value) => SERIES_LABELS[value] ?? value}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Line
          type="monotone"
          dataKey="bruto"
          stroke="#C9A227"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="liquido"
          stroke="#059669"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
