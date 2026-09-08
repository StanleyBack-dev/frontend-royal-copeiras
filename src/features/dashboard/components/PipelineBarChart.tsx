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
import type { PipelineTrendPoint } from "../model/aggregations";

const SERIES_LABELS: Record<string, string> = {
  orcamentos: "Orçamentos criados",
  contratos: "Contratos criados",
};

export default function PipelineBarChart({
  data,
}: {
  data: PipelineTrendPoint[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8d5c9" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "#7a4430" }}
          axisLine={{ stroke: "#e8d5c9" }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: "#7a4430" }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip
          formatter={(value, name) => [
            value,
            SERIES_LABELS[String(name)] ?? String(name),
          ]}
          labelStyle={{ color: "#2c1810", fontWeight: 600 }}
          contentStyle={{ borderRadius: 12, borderColor: "#e8d5c9" }}
        />
        <Legend
          formatter={(value) => SERIES_LABELS[value] ?? value}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="orcamentos" fill="#C9A227" radius={[6, 6, 0, 0]} />
        <Bar dataKey="contratos" fill="#7a4430" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
