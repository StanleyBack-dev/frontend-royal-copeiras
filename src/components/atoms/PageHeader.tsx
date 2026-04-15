import React from "react";
import { colors, typography } from "../../config";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <header
      className={`flex flex-col gap-4 border-b bg-white px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between ${className}`}
      style={{ borderColor: colors.brown[100], background: colors.white }}
    >
      <div className="min-w-0">
        <h2
          className="text-lg font-bold sm:text-xl"
          style={{
            color: colors.brown[800],
            fontFamily: typography.fontFamily,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="mt-1 text-xs sm:text-sm"
            style={{
              color: colors.brown[300],
              fontFamily: typography.fontFamily,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
          {actions}
        </div>
      )}
    </header>
  );
}
