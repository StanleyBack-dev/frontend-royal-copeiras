// Atom: Input
import React, { InputHTMLAttributes } from "react";
import { colors, typography, radii } from "../../config";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
  wrapperClassName?: string;
  error?: string;
  trailing?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      labelClassName = "",
      wrapperClassName = "",
      error,
      trailing,
      ...props
    },
    ref,
  ) => (
    <div className={wrapperClassName}>
      {label && (
        <label
          className={`text-xs font-semibold uppercase tracking-wide mb-1 block ${labelClassName}`}
          style={{
            color: colors.brown[500],
            fontFamily: typography.fontFamily,
          }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          {...props}
          className={`w-full px-3 py-2.5 rounded-lg text-sm border outline-none ${trailing ? "pr-10" : ""} ${props.className || ""} ${error ? "border-red-500" : ""}`}
          style={{
            borderColor: error ? colors.red[500] : colors.brown[100],
            color: colors.brown[800],
            fontFamily: typography.fontFamily,
            borderRadius: radii.md,
            ...(props.style || {}),
          }}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {trailing}
          </div>
        )}
      </div>
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  ),
);

Input.displayName = "Input";
export default Input;
