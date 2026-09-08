import type { Budget } from "@/api/budgets/schema";
import type { Contract } from "@/api/contracts/schema";
import type { Event } from "@/api/events/schema";
import {
  getBudgetStatusLabel,
  getBudgetStatusTone,
} from "@/features/budgets/model/status";
import {
  getContractStatusLabel,
  getContractStatusTone,
} from "@/features/contracts/model/status";
import {
  findBucketIndex,
  isWithinRange,
  type PeriodBucket,
  type PeriodRange,
} from "./period";

const STATUS_TONE_COLORS: Record<string, string> = {
  neutral: "#64748b",
  warning: "#d97706",
  success: "#059669",
  danger: "#e11d48",
};

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Multi-day events only carry an array of dates; the first date is the
 * anchor used everywhere else in the app (e.g. the dashboard's upcoming
 * events list) to represent "when this event happens". */
export function getEventAnchorDate(event: Event): string | undefined {
  return event.eventDates?.[0] || undefined;
}

export function filterEventsInRange(
  events: Event[],
  range: PeriodRange,
): Event[] {
  return events.filter((event) =>
    isWithinRange(getEventAnchorDate(event), range),
  );
}

export function filterBudgetsInRange(
  budgets: Budget[],
  range: PeriodRange,
): Budget[] {
  return budgets.filter((budget) => isWithinRange(budget.issueDate, range));
}

export function filterContractsInRange(
  contracts: Contract[],
  range: PeriodRange,
): Contract[] {
  return contracts.filter((contract) =>
    isWithinRange(contract.createdAt, range),
  );
}

export interface FinancialTotals {
  grossRevenue: number;
  staffCost: number;
  netRevenue: number;
  eventsCount: number;
}

export function summarizeEventFinancials(events: Event[]): FinancialTotals {
  const totals = events.reduce(
    (acc, event) => ({
      grossRevenue: acc.grossRevenue + Number(event.totalRevenue || 0),
      staffCost: acc.staffCost + Number(event.totalCost || 0),
      netRevenue: acc.netRevenue + Number(event.companyReceivable || 0),
      eventsCount: acc.eventsCount + 1,
    }),
    { grossRevenue: 0, staffCost: 0, netRevenue: 0, eventsCount: 0 },
  );

  return {
    grossRevenue: roundCurrency(totals.grossRevenue),
    staffCost: roundCurrency(totals.staffCost),
    netRevenue: roundCurrency(totals.netRevenue),
    eventsCount: totals.eventsCount,
  };
}

export interface RevenueTrendPoint {
  label: string;
  bruto: number;
  liquido: number;
}

export function buildRevenueTrend(
  events: Event[],
  buckets: PeriodBucket[],
): RevenueTrendPoint[] {
  const points = buckets.map((bucket) => ({
    label: bucket.label,
    bruto: 0,
    liquido: 0,
  }));

  events.forEach((event) => {
    const index = findBucketIndex(buckets, getEventAnchorDate(event));
    if (index === -1) return;
    points[index].bruto += Number(event.totalRevenue || 0);
    points[index].liquido += Number(event.companyReceivable || 0);
  });

  return points.map((point) => ({
    label: point.label,
    bruto: roundCurrency(point.bruto),
    liquido: roundCurrency(point.liquido),
  }));
}

export interface PipelineTrendPoint {
  label: string;
  orcamentos: number;
  contratos: number;
}

export function buildPipelineTrend(
  budgets: Budget[],
  contracts: Contract[],
  buckets: PeriodBucket[],
): PipelineTrendPoint[] {
  const points = buckets.map((bucket) => ({
    label: bucket.label,
    orcamentos: 0,
    contratos: 0,
  }));

  budgets.forEach((budget) => {
    const index = findBucketIndex(buckets, budget.issueDate);
    if (index !== -1) points[index].orcamentos += 1;
  });

  contracts.forEach((contract) => {
    const index = findBucketIndex(buckets, contract.createdAt);
    if (index !== -1) points[index].contratos += 1;
  });

  return points;
}

export interface StatusSlice {
  label: string;
  value: number;
  color: string;
}

export function buildBudgetStatusBreakdown(budgets: Budget[]): StatusSlice[] {
  const groups = new Map<string, StatusSlice>();

  budgets.forEach((budget) => {
    const label = getBudgetStatusLabel(budget.status);
    const color = STATUS_TONE_COLORS[getBudgetStatusTone(budget.status)];
    const current = groups.get(label) ?? { label, value: 0, color };
    current.value += 1;
    groups.set(label, current);
  });

  return Array.from(groups.values());
}

export function buildContractStatusBreakdown(
  contracts: Contract[],
): StatusSlice[] {
  const groups = new Map<string, StatusSlice>();

  contracts.forEach((contract) => {
    const label = getContractStatusLabel(contract.status);
    const color = STATUS_TONE_COLORS[getContractStatusTone(contract.status)];
    const current = groups.get(label) ?? { label, value: 0, color };
    current.value += 1;
    groups.set(label, current);
  });

  return Array.from(groups.values());
}

export function calculateConversionRate(
  budgetsCount: number,
  contractsCount: number,
): number {
  if (budgetsCount <= 0) return 0;
  return roundCurrency((contractsCount / budgetsCount) * 100);
}

export interface TrendDelta {
  changePercent: number | null;
  direction: "up" | "down" | "flat";
}

export function calculateTrendDelta(
  current: number,
  previous: number,
): TrendDelta {
  if (previous === 0) {
    if (current === 0) return { changePercent: 0, direction: "flat" };
    return { changePercent: null, direction: "up" };
  }

  const changePercent = roundCurrency(((current - previous) / previous) * 100);
  const direction =
    changePercent > 0 ? "up" : changePercent < 0 ? "down" : "flat";

  return { changePercent, direction };
}
