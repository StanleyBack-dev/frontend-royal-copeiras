import React from 'react';
// import { typography } from '../tokens/index';

export interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ icon, ...props }, ref) => (
    <div className="flex items-center bg-[#f5ede8] rounded-lg px-2 py-1 gap-2">
      {icon && <span className="text-[#7a4430]">{icon}</span>}
      <input
        ref={ref}
        {...props}
        className="bg-transparent outline-none text-[#7a4430] text-sm flex-1"
          // style={{ fontFamily: typography.fontFamily }}
      />
    </div>
  ),
);
SearchBar.displayName = 'SearchBar';
