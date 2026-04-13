// Atom: Textarea
import React, { TextareaHTMLAttributes } from "react";
import { colors, typography, radii } from "../../config";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  labelClassName?: string;
  wrapperClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, labelClassName = "", wrapperClassName = "", ...props }, ref) => (
    <div className={wrapperClassName}>
      {label && (
        <label
          className={`text-xs font-semibold uppercase tracking-wide mb-1 block ${labelClassName}`}
          style={{ color: colors.brown[500], fontFamily: typography.fontFamily }}
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        {...props}
        className={`w-full px-3 py-2.5 rounded-lg text-sm border outline-none resize-none ${props.className || ""}`}
        style={{
          borderColor: colors.brown[100],
          color: colors.brown[800],
          fontFamily: typography.fontFamily,
          borderRadius: radii.md,
          ...(props.style || {}),
        }}
      />
    </div>
  ),
);

Textarea.displayName = "Textarea";
export default Textarea;
