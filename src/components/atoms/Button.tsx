import React, { ButtonHTMLAttributes } from "react";
import { colors, typography, radii } from "../../config";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

const baseStyles = `flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none`;
const variants = {
  primary: `bg-gradient-to-tr from-[${colors.gold[500]}] to-[${colors.gold[600]}] text-white hover:opacity-90`,
  secondary: `bg-[${colors.brown[50]}] text-[${colors.brown[500]}] hover:bg-[${colors.brown[100]}]`,
  danger: `bg-[${colors.red[600]}] text-white hover:bg-[${colors.red[700]}]`,
  outline: `border border-[${colors.brown[100]}] text-[${colors.brown[800]}] bg-white hover:bg-[${colors.brown[50]}]`,
};
const sizes = {
  sm: `px-3 py-1.5 text-xs`,
  md: `px-4 py-2.5 text-sm`,
  lg: `px-6 py-3 text-base`,
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      leftIcon,
      rightIcon,
      loading,
      children,
      className = "",
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      style={{ fontFamily: typography.fontFamily, borderRadius: radii.md, ...props.style }}
      disabled={loading || props.disabled}
      {...props}
    >
      {leftIcon && <span>{leftIcon}</span>}
      {loading ? "Carregando..." : children}
      {rightIcon && <span>{rightIcon}</span>}
    </button>
  ),
);

Button.displayName = "Button";
export default Button;
