import React from "react";
import Toggle from "../atoms/Toggle";
import { colors, typography } from "../../config";

interface SettingRowProps {
  label: string;
  description: string;
  right?: React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  toggleProps?: React.ComponentProps<typeof Toggle>;
}

export default function SettingRow({
  label,
  description,
  right,
  checked,
  onChange,
  toggleProps,
}: SettingRowProps) {
  return (
    <div
      className="flex flex-col gap-3 border-b py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
      style={{ borderColor: colors.brown[100] }}
    >
      <div className="min-w-0">
        <p
          className="text-sm font-medium"
          style={{
            color: colors.brown[800],
            fontFamily: typography.fontFamily,
          }}
        >
          {label}
        </p>
        <p
          className="text-xs mt-0.5"
          style={{
            color: colors.brown[300],
            fontFamily: typography.fontFamily,
          }}
        >
          {description}
        </p>
      </div>
      {right ? (
        right
      ) : typeof checked === "boolean" && onChange ? (
        <div className="self-start sm:self-center">
          <Toggle checked={checked} onChange={onChange} {...toggleProps} />
        </div>
      ) : null}
    </div>
  );
}
