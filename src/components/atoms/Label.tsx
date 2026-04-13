import React, { LabelHTMLAttributes } from "react";
import { colors, typography } from "../../config";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  className?: string;
}

export default function Label({
  children,
  className = "",
  ...props
}: LabelProps) {
  return (
    <label
      className={`text-xs font-semibold uppercase tracking-wide mb-1 block ${className}`}
      style={{ color: colors.brown[500], fontFamily: typography.fontFamily }}
      {...props}
    >
      {children}
    </label>
  );
}
