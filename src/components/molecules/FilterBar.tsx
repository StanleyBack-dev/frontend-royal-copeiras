import React from "react";
import Button from "../atoms/Button";
import SearchBar from "../atoms/SearchBar";

interface FilterBarProps {
  search: string;
  setSearch: (value: string) => void;
  onAction: () => void;
  actionLabel: string;
  placeholder?: string;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  className?: string;
}

export default function FilterBar({
  search,
  setSearch,
  onAction,
  actionLabel,
  placeholder = "Buscar...",
  icon,
  leftIcon,
  className = "",
}: FilterBarProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={placeholder}
        icon={icon}
      />
      <Button
        leftIcon={leftIcon}
        onClick={onAction}
        variant="primary"
        size="md"
        style={{ minWidth: 140 }}
      >
        {actionLabel}
      </Button>
    </div>
  );
}
