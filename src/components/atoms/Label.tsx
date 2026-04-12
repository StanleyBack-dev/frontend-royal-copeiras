import React, { LabelHTMLAttributes } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  className?: string;
}

export default function Label({ children, className = '', ...props }: LabelProps) {
  return (
    <label className={`text-xs font-semibold uppercase tracking-wide mb-1 block ${className}`} style={{ color: '#7a4430' }} {...props}>
      {children}
    </label>
  );
}
