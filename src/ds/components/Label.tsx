import React from "react";
import { colors } from "../tokens/index";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, ...props }, ref) => (
    <label
      ref={ref}
      className="text-xs font-semibold uppercase tracking-wide mb-1 block"
      style={{ color: colors.brown[500] }}
      {...props}
    >
      {children}
    </label>
  ),
);
Label.displayName = "Label";
