import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

const baseStyles = 'flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none';
const variants = {
  primary: 'bg-gradient-to-tr from-[#C9A227] to-[#a8811a] text-white hover:opacity-90',
  secondary: 'bg-[#f5ede8] text-[#7a4430] hover:bg-[#e8d5c9]',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'border border-[#e8d5c9] text-[#2C1810] bg-white hover:bg-[#f5ede8]'
};
const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base'
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', leftIcon, rightIcon, loading, children, className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {leftIcon && <span>{leftIcon}</span>}
      {loading ? 'Carregando...' : children}
      {rightIcon && <span>{rightIcon}</span>}
    </button>
  )
);

Button.displayName = 'Button';
export default Button;
