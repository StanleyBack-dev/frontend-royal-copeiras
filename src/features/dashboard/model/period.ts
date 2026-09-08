export type PeriodPreset = "7d" | "30d" | "month" | "year" | "custom";

export interface PeriodRange {
  preset: PeriodPreset;
  startDate: string;
  endDate: string;
}

export const periodPresetOptions: { value: PeriodPreset; label: string }[] = [
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "month", label: "Este mês" },
  { value: "year", label: "Este ano" },
  { value: "custom", label: "Personalizado" },
];

const SHORT_MONTH_LABELS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function parseIsoDate(value: string): Date {
  return new Date(`${value.slice(0, 10)}T00:00:00`);
}

/**
 * Resolves a preset (or explicit custom range) into concrete start/end
 * dates. "custom" always requires both bounds — callers fall back to the
 * last-30-days range until the user picks both dates.
 */
export function resolvePeriodRange(
  preset: PeriodPreset,
  customStartDate?: string,
  customEndDate?: string,
): PeriodRange {
  const today = startOfDay(new Date());

  if (preset === "custom") {
    if (customStartDate && customEndDate) {
      return { preset, startDate: customStartDate, endDate: customEndDate };
    }
    return resolvePeriodRange("30d");
  }

  if (preset === "month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { preset, startDate: toIsoDate(start), endDate: toIsoDate(today) };
  }

  if (preset === "year") {
    const start = new Date(today.getFullYear(), 0, 1);
    return { preset, startDate: toIsoDate(start), endDate: toIsoDate(today) };
  }

  const daysBack = preset === "7d" ? 6 : 29;
  const start = addDays(today, -daysBack);
  return { preset, startDate: toIsoDate(start), endDate: toIsoDate(today) };
}

/** The immediately preceding range of the same length, for trend deltas. */
export function getPreviousPeriodRange(range: PeriodRange): PeriodRange {
  const start = parseIsoDate(range.startDate);
  const end = parseIsoDate(range.endDate);
  const durationDays =
    Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  const previousEnd = addDays(start, -1);
  const previousStart = addDays(previousEnd, -(durationDays - 1));

  return {
    preset: "custom",
    startDate: toIsoDate(previousStart),
    endDate: toIsoDate(previousEnd),
  };
}

export function isWithinRange(
  dateValue: string | undefined,
  range: PeriodRange,
): boolean {
  if (!dateValue) return false;
  const date = dateValue.slice(0, 10);
  return date >= range.startDate && date <= range.endDate;
}

export type BucketGranularity = "day" | "week" | "month";

export interface PeriodBucket {
  key: string;
  label: string;
  start: Date;
  end: Date;
}

export function resolveBucketGranularity(
  range: PeriodRange,
): BucketGranularity {
  const start = parseIsoDate(range.startDate);
  const end = parseIsoDate(range.endDate);
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;

  if (days <= 31) return "day";
  if (days <= 180) return "week";
  return "month";
}

/** Splits a range into evenly-sized buckets for trend charts, picking a
 * granularity that keeps the chart readable regardless of period length. */
export function buildPeriodBuckets(range: PeriodRange): PeriodBucket[] {
  const granularity = resolveBucketGranularity(range);
  const start = parseIsoDate(range.startDate);
  const end = parseIsoDate(range.endDate);
  const buckets: PeriodBucket[] = [];

  if (granularity === "month") {
    let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cursor <= end) {
      const bucketEnd = new Date(
        cursor.getFullYear(),
        cursor.getMonth() + 1,
        1,
      );
      buckets.push({
        key: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`,
        label: `${SHORT_MONTH_LABELS[cursor.getMonth()]}/${String(cursor.getFullYear()).slice(2)}`,
        start: new Date(cursor),
        end: bucketEnd,
      });
      cursor = bucketEnd;
    }
    return buckets;
  }

  const stepDays = granularity === "week" ? 7 : 1;
  let cursor = new Date(start);
  while (cursor <= end) {
    const bucketEnd = addDays(cursor, stepDays);
    buckets.push({
      key: toIsoDate(cursor),
      label: `${String(cursor.getDate()).padStart(2, "0")}/${String(cursor.getMonth() + 1).padStart(2, "0")}`,
      start: new Date(cursor),
      end: bucketEnd,
    });
    cursor = bucketEnd;
  }
  return buckets;
}

export function findBucketIndex(
  buckets: PeriodBucket[],
  dateValue: string | undefined,
): number {
  if (!dateValue) return -1;
  const date = parseIsoDate(dateValue);
  if (Number.isNaN(date.getTime())) return -1;
  return buckets.findIndex(
    (bucket) => date >= bucket.start && date < bucket.end,
  );
}
