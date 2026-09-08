import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { StatusSlice } from "../model/aggregations";

interface StatusPieChartProps {
  data: StatusSlice[];
  formatValue?: (value: number) => string;
}

export default function StatusPieChart({
  data,
  formatValue = (value) => String(value),
}: StatusPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius={58}
          outerRadius={90}
          paddingAngle={2}
          strokeWidth={2}
          stroke="#fff"
        >
          {data.map((entry) => (
            <Cell key={entry.label} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [
            formatValue(Number(value ?? 0)),
            String(name),
          ]}
          contentStyle={{ borderRadius: 12, borderColor: "#e8d5c9" }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
