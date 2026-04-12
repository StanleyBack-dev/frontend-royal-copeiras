import React from "react";

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
      style={{ borderColor: "#e8d5c9" }}
    >
      <div>
        <h2 className="text-lg font-bold" style={{ color: "#2C1810" }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs" style={{ color: "#9a7060" }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
