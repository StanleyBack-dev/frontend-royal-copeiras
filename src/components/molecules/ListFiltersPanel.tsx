import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import Button from "../atoms/Button";
import Input from "../atoms/Input";
import Select from "../atoms/Select";

interface FilterOption {
  value: string;
  label: string;
}

interface ListFiltersPanelProps {
  statusLabel?: string;
  statusValue: string;
  statusOptions: FilterOption[];
  onStatusChange: (value: string) => void;
  startDateValue: string;
  endDateValue: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClear: () => void;
  extraFilters?: ReactNode;
  hasActiveFilters?: boolean;
}

export default function ListFiltersPanel({
  statusLabel = "Status",
  statusValue,
  statusOptions,
  onStatusChange,
  startDateValue,
  endDateValue,
  onStartDateChange,
  onEndDateChange,
  onClear,
  extraFilters,
  hasActiveFilters,
}: ListFiltersPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const shouldEnableClear =
    hasActiveFilters ??
    (Boolean(statusValue) || Boolean(startDateValue) || Boolean(endDateValue));

  return (
    <div className="mb-4 rounded-2xl border border-[#e8d5c9] bg-[#faf6f2]">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-[#2C1810]"
      >
        <span>Filtros</span>
        {shouldEnableClear ? (
          <span
            className="h-2 w-2 rounded-full bg-[#C9A227]"
            aria-label="Filtros ativos"
          />
        ) : null}
        <ChevronDown
          size={18}
          className={`text-[#7a4430] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div className="border-t border-[#e8d5c9] p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <Select
              label={statusLabel}
              value={statusValue}
              onChange={(event) => onStatusChange(event.target.value)}
              wrapperClassName="xl:col-span-1"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Input
              label="Data inicial"
              type="date"
              value={startDateValue}
              onChange={(event) => onStartDateChange(event.target.value)}
              wrapperClassName="xl:col-span-1"
            />
            <Input
              label="Data final"
              type="date"
              value={endDateValue}
              onChange={(event) => onEndDateChange(event.target.value)}
              wrapperClassName="xl:col-span-1"
            />
            {extraFilters ? extraFilters : <div className="xl:col-span-1" />}
            <div className="flex items-end xl:col-span-1">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={onClear}
                disabled={!shouldEnableClear}
              >
                Limpar filtros
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
