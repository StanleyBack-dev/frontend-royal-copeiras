import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { periodPresetOptions, type PeriodPreset } from "../model/period";

interface PeriodFilterProps {
  preset: PeriodPreset;
  onPresetChange: (preset: PeriodPreset) => void;
  customStartDate: string;
  customEndDate: string;
  onCustomStartDateChange: (value: string) => void;
  onCustomEndDateChange: (value: string) => void;
}

export default function PeriodFilter({
  preset,
  onPresetChange,
  customStartDate,
  customEndDate,
  onCustomStartDateChange,
  onCustomEndDateChange,
}: PeriodFilterProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#e8d5c9] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {periodPresetOptions.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={preset === option.value ? "primary" : "outline"}
            onClick={() => onPresetChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {preset === "custom" ? (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            value={customStartDate}
            onChange={(event) => onCustomStartDateChange(event.target.value)}
            wrapperClassName="w-auto"
          />
          <span className="text-sm text-[#7a4430]">até</span>
          <Input
            type="date"
            value={customEndDate}
            onChange={(event) => onCustomEndDateChange(event.target.value)}
            wrapperClassName="w-auto"
          />
        </div>
      ) : null}
    </div>
  );
}
