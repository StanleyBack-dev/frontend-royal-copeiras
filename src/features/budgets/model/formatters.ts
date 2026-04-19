import { onlyDigits } from "../../../utils/format";
import {
  BUDGET_DEFAULT_VALIDITY_DAYS,
  BUDGET_DURATION_HOURS_MAX,
  BUDGET_EVENT_MAX_DAYS,
} from "./constants";
import {
  addDaysToIsoDate,
  buildEventDates,
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
  const normalizedDurationDigits = onlyDigits(values.durationHours).slice(0, 2);

  return {
    ...values,
    validUntil: shouldAutoSyncValidity(values, previousValues)
      ? addDaysToIsoDate(values.issueDate, BUDGET_DEFAULT_VALIDITY_DAYS)
      : values.validUntil,
    eventDaysCount,
    eventDates: buildEventDates(eventDatesCount, values.eventDates),
    guestCount: onlyDigits(values.guestCount),
    durationHours: normalizedDurationDigits
      ? String(
          Math.min(Number(normalizedDurationDigits), BUDGET_DURATION_HOURS_MAX),
        )
      : "",
    advancePercentage: onlyDigits(values.advancePercentage).slice(0, 3),
    items: values.items.map((item) => ({
      ...item,
      serviceType: item.serviceType,
      quantity: onlyDigits(item.quantity),
      unitPrice: formatCurrencyInput(item.unitPrice),
      description: item.description,
    })),
  };
}
