import { formatCurrencyInput } from "@/features/budgets/model/formatters";

/** Overtime is informed in steps of this many minutes (mirrors the backend rule). */
export const EVENT_OVERTIME_INTERVAL_MINUTES = 30;

const EVENT_OVERTIME_MAX_HOURS = 24;

function padTimePart(value: number) {
  return String(value).padStart(2, "0");
}

export function formatOvertimeMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${padTimePart(hours)}:${padTimePart(minutes)}`;
}

export const eventOvertimeOptions = Array.from(
  {
    length: (EVENT_OVERTIME_MAX_HOURS * 60) / EVENT_OVERTIME_INTERVAL_MINUTES,
  },
  (_, index) => {
    const minutes = (index + 1) * EVENT_OVERTIME_INTERVAL_MINUTES;

    return {
      value: String(minutes),
      label: formatOvertimeMinutes(minutes),
    };
  },
);

/** Formats a stored amount (e.g. 90) into the masked currency input value. */
export function toCurrencyInputValue(value?: number | null): string {
  return formatCurrencyInput(String(Math.round(Number(value || 0) * 100)));
}
