import type { ReactNode } from "react";

export type StatusBadgeTone = "neutral" | "warning" | "success" | "danger";

const toneClasses: Record<StatusBadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700 border-slate-200",
  warning: "bg-amber-50 text-amber-800 border-amber-300",
  success: "bg-emerald-50 text-emerald-700 border-emerald-300",
  danger: "bg-rose-50 text-rose-700 border-rose-300",
};

interface StatusBadgeProps {
  label: ReactNode;
  tone?: StatusBadgeTone;
  className?: string;
}

export default function StatusBadge({
  label,
  tone = "neutral",
  className = "",
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${toneClasses[tone]} ${className}`}
    >
      {label}
    </span>
  );
}
