// Atom: Textarea
import React, { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  labelClassName?: string;
  wrapperClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, labelClassName = '', wrapperClassName = '', ...props }, ref) => (
    <div className={wrapperClassName}>
      {label && (
        <label className={`text-xs font-semibold uppercase tracking-wide mb-1 block ${labelClassName}`} style={{ color: '#7a4430' }}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        {...props}
        className={`w-full px-3 py-2.5 rounded-lg text-sm border outline-none resize-none ${props.className || ''}`}
        style={{ borderColor: '#e8d5c9', color: '#2C1810', ...(props.style || {}) }}
      />
    </div>
  )
);

Textarea.displayName = 'Textarea';
export default Textarea;
