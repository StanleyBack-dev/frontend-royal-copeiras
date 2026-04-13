import React, { InputHTMLAttributes } from "react";
import { colors, typography, radii } from "../../config";

interface SearchBarProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
  className = "",
  icon,
  ...props
}: SearchBarProps) {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-2.5 border ${className}`}
      style={{ background: colors.white, borderColor: colors.brown[100], borderRadius: radii.md }}
    >
      {icon}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="outline-none text-sm bg-transparent w-56"
        style={{ color: colors.brown[800], fontFamily: typography.fontFamily }}
        {...props}
      />
    </div>
  );
}
