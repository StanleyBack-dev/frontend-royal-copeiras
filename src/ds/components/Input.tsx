import React from 'react';
import { colors } from '../tokens/index';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => (
    <div>
      {label && (
        <label
          className="text-xs font-semibold uppercase tracking-wide mb-1 block"
          style={{ color: colors.brown[500] }}
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        {...props}
        className={`w-full px-3 py-2.5 rounded-lg text-sm border outline-none ${error ? 'border-red-500' : ''}`}
        style={{
          borderColor: error ? '#e53e3e' : colors.brown[100],
          color: colors.brown[800],
            // fontFamily: typography.fontFamily,
        }}
      />
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  ),
);
Input.displayName = 'Input';
