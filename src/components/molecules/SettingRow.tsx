// Molecule: SettingRow
import React from "react";
import Toggle from "../atoms/Toggle";

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
      className="flex items-center justify-between py-4 border-b last:border-0"
      style={{ borderColor: "#e8d5c9" }}
    >
      <div>
        <p className="text-sm font-medium" style={{ color: "#2C1810" }}>
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "#9a7060" }}>
          {description}
        </p>
      </div>
      {right ? (
        right
      ) : typeof checked === "boolean" && onChange ? (
        <Toggle checked={checked} onChange={onChange} {...toggleProps} />
      ) : null}
    </div>
  );
}
