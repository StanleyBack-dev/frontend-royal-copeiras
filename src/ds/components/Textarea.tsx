import React from "react";
import { colors } from "../tokens/index";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, ...props }, ref) => (
    <div>
      {label && (
        <label
          className="text-xs font-semibold uppercase tracking-wide mb-1 block"
          style={{ color: colors.brown[500] }}
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        {...props}
        className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none resize-none"
        style={{
          borderColor: colors.brown[100],
          color: colors.brown[800],
          // fontFamily: typography.fontFamily,
        }}
      />
    </div>
  ),
);
Textarea.displayName = "Textarea";
