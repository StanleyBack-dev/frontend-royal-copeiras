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
    <div
      className={`mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="w-full sm:max-w-md">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          icon={searchIcon}
        />
      </div>
      {actions ||
        (action ? (
          <Button
            leftIcon={action.leftIcon}
            onClick={action.onClick}
            variant="primary"
            size="md"
            className="w-full sm:w-auto"
            style={{ minWidth: action.minWidth ?? 140 }}
          >
            {action.label}
          </Button>
        ) : null)}
    </div>
  );
}
