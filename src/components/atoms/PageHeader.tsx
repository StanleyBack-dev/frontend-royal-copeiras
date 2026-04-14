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
      className={`flex items-center justify-between py-4 px-6 border-b bg-white ${className}`}
      style={{ borderColor: colors.brown[100], background: colors.white }}
    >
      <div>
        <h2
          className="text-lg font-bold"
          style={{
            color: colors.brown[800],
            fontFamily: typography.fontFamily,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="text-xs"
            style={{
              color: colors.brown[300],
              fontFamily: typography.fontFamily,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
