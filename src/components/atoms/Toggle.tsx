// Atom: Toggle
import React, { ButtonHTMLAttributes } from "react";
import { colors } from "../../config";

interface ToggleProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange"
> {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked, onChange, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className="relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none"
      style={{ background: checked ? colors.gold[500] : colors.brown[100] }}
      {...props}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  ),
);

Toggle.displayName = "Toggle";
export default Toggle;
