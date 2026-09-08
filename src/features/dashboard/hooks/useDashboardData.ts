import { useEffect, useMemo, useState } from "react";
import { getBudgets } from "@/api/budgets/methods";
import { getEvents } from "@/api/events/methods";
import { fetchContracts } from "@/features/contracts/services/contract.service";
import type { Budget } from "@/api/budgets/schema";
import type { Contract } from "@/api/contracts/schema";
import type { Event } from "@/api/events/schema";
import {
  buildBudgetStatusBreakdown,
  buildContractStatusBreakdown,
  buildPipelineTrend,
  buildRevenueTrend,
  calculateConversionRate,
  calculateTrendDelta,
  filterBudgetsInRange,
  filterContractsInRange,
  filterEventsInRange,
  summarizeEventFinancials,
} from "../model/aggregations";
import {
  buildPeriodBuckets,
  getPreviousPeriodRange,
  resolvePeriodRange,
  type PeriodPreset,
} from "../model/period";

const HISTORY_FETCH_LIMIT = 1000;

interface RawData {
  budgets: Budget[];
  contracts: Contract[];
  events: Event[];
}

const EMPTY_RAW_DATA: RawData = { budgets: [], contracts: [], events: [] };

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState<RawData>(EMPTY_RAW_DATA);
  const [preset, setPreset] = useState<PeriodPreset>("30d");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      const [budgetsResult, contractsResult, eventsResult] =
        await Promise.allSettled([
          getBudgets({ page: 1, limit: HISTORY_FETCH_LIMIT }),
          fetchContracts({ page: 1, limit: HISTORY_FETCH_LIMIT }),
          getEvents({ page: 1, limit: HISTORY_FETCH_LIMIT }),
        ]);

      if (!active) return;

      setRaw({
        budgets:
          budgetsResult.status === "fulfilled" ? budgetsResult.value.items : [],
        contracts:
          contractsResult.status === "fulfilled"
            ? contractsResult.value.items
            : [],
        events:
          eventsResult.status === "fulfilled" ? eventsResult.value.items : [],
      });
      setLoading(false);
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const range = useMemo(
    () => resolvePeriodRange(preset, customStartDate, customEndDate),
    [preset, customStartDate, customEndDate],
  );

  const previousRange = useMemo(() => getPreviousPeriodRange(range), [range]);

  const buckets = useMemo(() => buildPeriodBuckets(range), [range]);

  const currentEvents = useMemo(
    () => filterEventsInRange(raw.events, range),
    [raw.events, range],
  );
  const previousEvents = useMemo(
    () => filterEventsInRange(raw.events, previousRange),
    [raw.events, previousRange],
  );
  const currentBudgets = useMemo(
    () => filterBudgetsInRange(raw.budgets, range),
    [raw.budgets, range],
  );
  const previousBudgets = useMemo(
    () => filterBudgetsInRange(raw.budgets, previousRange),
    [raw.budgets, previousRange],
  );
  const currentContracts = useMemo(
    () => filterContractsInRange(raw.contracts, range),
    [raw.contracts, range],
  );
  const previousContracts = useMemo(
    () => filterContractsInRange(raw.contracts, previousRange),
    [raw.contracts, previousRange],
  );

  const financials = useMemo(
    () => summarizeEventFinancials(currentEvents),
    [currentEvents],
  );
  const previousFinancials = useMemo(
    () => summarizeEventFinancials(previousEvents),
    [previousEvents],
  );

  const conversionRate = useMemo(
    () =>
      calculateConversionRate(currentBudgets.length, currentContracts.length),
    [currentBudgets.length, currentContracts.length],
  );
  const previousConversionRate = useMemo(
    () =>
      calculateConversionRate(previousBudgets.length, previousContracts.length),
    [previousBudgets.length, previousContracts.length],
  );

  const trends = useMemo(
    () => ({
      grossRevenue: calculateTrendDelta(
        financials.grossRevenue,
        previousFinancials.grossRevenue,
      ),
      netRevenue: calculateTrendDelta(
        financials.netRevenue,
        previousFinancials.netRevenue,
      ),
      staffCost: calculateTrendDelta(
        financials.staffCost,
        previousFinancials.staffCost,
      ),
      eventsCount: calculateTrendDelta(
        financials.eventsCount,
        previousFinancials.eventsCount,
      ),
      budgetsCount: calculateTrendDelta(
        currentBudgets.length,
        previousBudgets.length,
      ),
      contractsCount: calculateTrendDelta(
        currentContracts.length,
        previousContracts.length,
      ),
      conversionRate: calculateTrendDelta(
        conversionRate,
        previousConversionRate,
      ),
    }),
    [
      financials,
      previousFinancials,
      currentBudgets.length,
      previousBudgets.length,
      currentContracts.length,
      previousContracts.length,
      conversionRate,
      previousConversionRate,
    ],
  );

  const revenueTrend = useMemo(
    () => buildRevenueTrend(currentEvents, buckets),
    [currentEvents, buckets],
  );
  const pipelineTrend = useMemo(
    () => buildPipelineTrend(currentBudgets, currentContracts, buckets),
    [currentBudgets, currentContracts, buckets],
  );
  const budgetStatusBreakdown = useMemo(
    () => buildBudgetStatusBreakdown(currentBudgets),
    [currentBudgets],
  );
  const contractStatusBreakdown = useMemo(
    () => buildContractStatusBreakdown(currentContracts),
    [currentContracts],
  );

  const averageTicket =
    financials.eventsCount > 0
      ? Math.round((financials.grossRevenue / financials.eventsCount) * 100) /
        100
      : 0;

  return {
    loading,
    range,
    preset,
    setPreset,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    raw,
    financials,
    trends,
    conversionRate,
    averageTicket,
    budgetsCount: currentBudgets.length,
    contractsCount: currentContracts.length,
    revenueTrend,
    pipelineTrend,
    budgetStatusBreakdown,
    contractStatusBreakdown,
  };
}
