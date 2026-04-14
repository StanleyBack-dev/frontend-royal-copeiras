import React from "react";
import Button from "../atoms/Button";
import SearchBar from "../atoms/SearchBar";

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  searchIcon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    leftIcon?: React.ReactNode;
    minWidth?: number;
  };
  actions?: React.ReactNode;
  className?: string;
}

export default function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  searchIcon,
  action,
  actions,
  className = "",
}: FilterBarProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <SearchBar
        value={searchValue}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        icon={searchIcon}
      />
      {actions ||
        (action ? (
          <Button
            leftIcon={action.leftIcon}
            onClick={action.onClick}
            variant="primary"
            size="md"
            style={{ minWidth: action.minWidth ?? 140 }}
          >
            {action.label}
          </Button>
        ) : null)}
    </div>
  );
}
