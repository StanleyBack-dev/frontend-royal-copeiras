// Atom: Select
import React, { SelectHTMLAttributes, ReactNode } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  labelClassName?: string;
  wrapperClassName?: string;
  children: ReactNode;
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      labelClassName = "",
      wrapperClassName = "",
      children,
      error,
      ...props
    },
    ref,
  ) => (
    <div className={wrapperClassName}>
      {label && (
        <label
          className={`text-xs font-semibold uppercase tracking-wide mb-1 block ${labelClassName}`}
          style={{ color: "#7a4430" }}
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        {...props}
        className={`w-full px-3 py-2.5 rounded-lg text-sm border outline-none ${props.className || ""} ${error ? "border-red-500" : ""}`}
        style={{
          borderColor: error ? "#e53e3e" : "#e8d5c9",
          color: "#2C1810",
          ...(props.style || {}),
        }}
      >
        {children}
      </select>
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  ),
);

Select.displayName = "Select";
export default Select;
