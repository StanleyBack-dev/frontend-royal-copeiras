import { onlyDigits } from "../../../utils/format";
import {
  BUDGET_DEFAULT_VALIDITY_DAYS,
  BUDGET_DURATION_HOURS_MAX,
  BUDGET_EVENT_MAX_DAYS,
} from "./constants";
import {
  addDaysToIsoDate,
  buildEventDates,
  buildEventTimes,
  emptyBudgetItemFormValues,
  type BudgetFormValues,
} from "./form";

export function formatCurrencyInput(value: string): string {
  const digits = onlyDigits(value);

  if (!digits) {
    return "";
  }

  const amount = Number(digits) / 100;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export function parseCurrencyInput(value: string): number | undefined {
  const digits = onlyDigits(value);

  if (!digits) {
    return undefined;
  }

  return Number(digits) / 100;
}

function shouldAutoSyncValidity(
  nextValues: BudgetFormValues,
  previousValues?: BudgetFormValues,
) {
  if (!nextValues.issueDate) {
    return false;
  }

  if (!previousValues) {
    return !nextValues.validUntil;
  }

  if (!nextValues.validUntil) {
    return true;
  }

  const previousAutoValidity = previousValues.issueDate
    ? addDaysToIsoDate(previousValues.issueDate, BUDGET_DEFAULT_VALIDITY_DAYS)
    : "";

  return previousValues.validUntil === previousAutoValidity;
}

export function normalizeBudgetFormValues(
  values: BudgetFormValues,
  previousValues?: BudgetFormValues,
): BudgetFormValues {
  const eventDaysCount =
    values.eventDateMode === "multiple"
      ? String(
          Math.min(
            Math.max(Number(onlyDigits(values.eventDaysCount) || 2), 2),
            BUDGET_EVENT_MAX_DAYS,
          ),
        )
      : "1";
  const eventDatesCount =
    values.eventDateMode === "multiple" ? Number(eventDaysCount) : 1;

  return {
    ...values,
    validUntil: shouldAutoSyncValidity(values, previousValues)
      ? addDaysToIsoDate(values.issueDate, BUDGET_DEFAULT_VALIDITY_DAYS)
      : values.validUntil,
    eventDaysCount,
    eventDates: buildEventDates(
      eventDatesCount,
      values.eventDates.map((value) => value.trim()),
    ),
    eventArrivalTimes: buildEventTimes(
      eventDatesCount,
      values.eventArrivalTimes.map((value) => value.trim()),
    ),
    eventDepartureTimes: buildEventTimes(
      eventDatesCount,
      values.eventDepartureTimes.map((value) => value.trim()),
    ),
    eventLocation: buildEventTimes(eventDatesCount, values.eventLocation),
    guestCount: buildEventTimes(
      eventDatesCount,
      values.guestCount.map((value) => onlyDigits(value)),
    ),
    durationHours: buildEventTimes(
      eventDatesCount,
      values.durationHours.map((value) => {
        const digits = onlyDigits(value).slice(0, 2);
        return digits
          ? String(Math.min(Number(digits), BUDGET_DURATION_HOURS_MAX))
          : "";
      }),
    ),
    advancePercentage: onlyDigits(values.advancePercentage).slice(0, 3),
    discountType: buildEventTimes(
      eventDatesCount,
      values.discountType,
    ) as BudgetFormValues["discountType"],
    discountPercentage: buildEventTimes(
      eventDatesCount,
      values.discountType,
    ).map((type, index) =>
      type === "percentage"
        ? onlyDigits(values.discountPercentage[index] ?? "").slice(0, 3)
        : "",
    ),
    discountAmount: buildEventTimes(eventDatesCount, values.discountType).map(
      (type, index) =>
        type === "amount"
          ? formatCurrencyInput(values.discountAmount[index] ?? "")
          : "",
    ),
    displacementFee: buildEventTimes(
      eventDatesCount,
      values.displacementFee,
    ).map((value) => formatCurrencyInput(value)),
    items: withDefaultItemPerDay(
      values.items.map((item) => ({
        ...item,
        serviceType: item.serviceType,
        quantity: onlyDigits(item.quantity),
        unitPrice: formatCurrencyInput(item.unitPrice),
        description: item.description,
        eventDateIndex: Math.min(item.eventDateIndex ?? 0, eventDatesCount - 1),
      })),
      eventDatesCount,
    ),
  };
}

/**
 * Every event day should start with an editable service slot, same as day
 * 1 — otherwise a newly added day renders as an empty section until the
 * user notices they have to click "Adicionar serviço" themselves.
 */
function withDefaultItemPerDay(
  items: BudgetFormValues["items"],
  eventDatesCount: number,
): BudgetFormValues["items"] {
  const coveredDays = new Set(items.map((item) => item.eventDateIndex ?? 0));
  const missingDayItems = Array.from(
    { length: eventDatesCount },
    (_, day) => day,
  )
    .filter((day) => !coveredDays.has(day))
    .map((day) => ({ ...emptyBudgetItemFormValues, eventDateIndex: day }));

  return [...items, ...missingDayItems];
}
