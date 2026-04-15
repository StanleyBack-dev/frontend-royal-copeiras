import React from "react";
import { colors, typography, radii } from "../../config";

interface StatCardProps {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  color?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function StatCard({
  icon,
  label,
  value,
  sub,
  color = colors.gold[500],
  children,
  className = "",
}: StatCardProps) {
  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm sm:p-5 lg:p-6 ${className}`}
      style={{ borderColor: colors.brown[100], borderRadius: radii.lg }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <p
          className="pr-2 text-sm font-medium sm:text-[15px]"
          style={{
            color: colors.brown[500],
            fontFamily: typography.fontFamily,
          }}
        >
          {label}
        </p>
        {icon && (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-11 sm:w-11"
            style={{ background: color + "20", color }}
          >
            {icon}
          </div>
        )}
      </div>
      <p
        className="mb-1 text-xl font-bold sm:text-2xl"
        style={{ color: colors.brown[800], fontFamily: typography.fontFamily }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="text-xs"
          style={{
            color: colors.brown[300],
            fontFamily: typography.fontFamily,
          }}
        >
          {sub}
        </p>
      )}
      {children}
    </div>
  );
}
