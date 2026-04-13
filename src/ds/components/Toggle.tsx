import React from "react";
import { colors } from "../tokens/index";

export interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, ...props }, ref) => (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        ref={ref}
        type="checkbox"
        className="appearance-none w-10 h-6 bg-gray-200 rounded-full relative transition-colors checked:bg-gold-500"
        style={{ background: colors.brown[100] }}
        {...props}
      />
      <span className="text-xs" style={{ color: colors.brown[800] }}>
        {label}
      </span>
    </label>
  ),
);
Toggle.displayName = "Toggle";
