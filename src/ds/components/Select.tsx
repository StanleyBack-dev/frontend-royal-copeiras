import React from "react";
import { colors } from "../tokens/index";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, children, ...props }, ref) => (
    <div>
      {label && (
        <label
          className="text-xs font-semibold uppercase tracking-wide mb-1 block"
          style={{ color: colors.brown[500] }}
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        {...props}
        className={`w-full px-3 py-2.5 rounded-lg text-sm border outline-none ${error ? "border-red-500" : ""}`}
        style={{
          borderColor: error ? "#e53e3e" : colors.brown[100],
          color: colors.brown[800],
          // fontFamily: typography.fontFamily,
        }}
      >
        {children}
      </select>
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  ),
);
Select.displayName = "Select";
