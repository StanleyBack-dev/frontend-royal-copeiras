// Atom: Input
import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, labelClassName = '', wrapperClassName = '', ...props }, ref) => (
    <div className={wrapperClassName}>
      {label && (
        <label className={`text-xs font-semibold uppercase tracking-wide mb-1 block ${labelClassName}`} style={{ color: '#7a4430' }}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        {...props}
        className={`w-full px-3 py-2.5 rounded-lg text-sm border outline-none ${props.className || ''}`}
        style={{ borderColor: '#e8d5c9', color: '#2C1810', ...(props.style || {}) }}
      />
    </div>
  )
);

Input.displayName = 'Input';
export default Input;
