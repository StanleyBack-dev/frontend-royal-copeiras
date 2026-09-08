import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { TrendDelta } from "../model/aggregations";

interface TrendBadgeProps {
  trend: TrendDelta;
  /** When true, an upward change is shown as unfavorable (e.g. rising costs). */
  invert?: boolean;
}

export default function TrendBadge({ trend, invert = false }: TrendBadgeProps) {
  if (trend.changePercent === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
        Novo no período
      </span>
    );
  }

  const isFlat = trend.direction === "flat";
  const isFavorable = invert
    ? trend.direction === "down"
    : trend.direction === "up";
  const colorClass = isFlat
    ? "text-slate-500"
    : isFavorable
      ? "text-emerald-600"
      : "text-rose-600";
  const Icon = isFlat
    ? Minus
    : trend.direction === "up"
      ? ArrowUpRight
      : ArrowDownRight;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold ${colorClass}`}
    >
      <Icon size={14} />
      {Math.abs(trend.changePercent).toFixed(1)}% vs período anterior
    </span>
  );
}
