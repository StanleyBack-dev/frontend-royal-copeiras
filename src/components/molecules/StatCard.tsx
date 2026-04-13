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
      className={`bg-white rounded-xl p-6 shadow-sm border ${className}`}
      style={{ borderColor: colors.brown[100], borderRadius: radii.lg }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium" style={{ color: colors.brown[500], fontFamily: typography.fontFamily }}>
          {label}
        </p>
        {icon && (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: color + "20", color }}
          >
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold mb-1" style={{ color: colors.brown[800], fontFamily: typography.fontFamily }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs" style={{ color: colors.brown[300], fontFamily: typography.fontFamily }}>
          {sub}
        </p>
      )}
      {children}
    </div>
  );
}
