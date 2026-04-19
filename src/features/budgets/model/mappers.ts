import type {
  Budget,
  CreateBudgetPayload,
  CreateBudgetItemPayload,
} from "../../../api/budgets/schema";
import { formatDateTimeDisplay } from "../../../utils/format";
import type { BudgetFormValues, BudgetItemFormValues } from "./form";
import { buildEventDates, budgetPaymentMethodOptions } from "./form";
import { formatCurrencyInput, parseCurrencyInput } from "./formatters";

function toDecimal(value: string): number | undefined {
  return parseCurrencyInput(value);
}

function mapBudgetItemFormToPayload(
  item: BudgetItemFormValues,
  index: number,
): CreateBudgetItemPayload {
  return {
    description: item.description.trim(),
    quantity: Number(item.quantity || 0),
    unitPrice: toDecimal(item.unitPrice) ?? 0,
    notes: item.notes.trim(),
    sortOrder: index,
  };
}

export function mapBudgetToFormValues(budget: Budget): BudgetFormValues {
  const eventDates = budget.eventDates?.length
    ? budget.eventDates.map((value) => value.slice(0, 10))
    : [""];

  return {
    budgetNumber: budget.budgetNumber,
    createdAt: formatDateTimeDisplay(budget.createdAt),
    idLeads: budget.idLeads || "",
    status: budget.status,
    issueDate: budget.issueDate.slice(0, 10),
    validUntil: budget.validUntil.slice(0, 10),
    eventDateMode: eventDates.length > 1 ? "multiple" : "single",
    eventDaysCount: String(eventDates.length || 1),
    eventDates: buildEventDates(eventDates.length || 1, eventDates),
    eventLocation: budget.eventLocation || "",
    guestCount: budget.guestCount != null ? String(budget.guestCount) : "",
    durationHours:
      budget.durationHours != null ? String(budget.durationHours) : "",
    paymentMethod:
      budget.paymentMethod &&
      budgetPaymentMethodOptions.includes(
        budget.paymentMethod as (typeof budgetPaymentMethodOptions)[number],
      )
        ? budget.paymentMethod
        : "",
    advancePercentage:
      budget.advancePercentage != null ? String(budget.advancePercentage) : "",
    notes: budget.notes || "",
    items: (budget.items || []).map((item) => ({
      id: item.idBudgetItems,
      description: item.description,
      quantity: String(item.quantity),
      unitPrice: formatCurrencyInput(String(item.unitPrice * 100)),
      notes: item.notes || "",
    })),
  };
}

export function mapBudgetFormToPayload(
  values: BudgetFormValues,
): CreateBudgetPayload {
  const items = values.items.map(mapBudgetItemFormToPayload);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  return {
    idLeads: values.idLeads || undefined,
    status: values.status,
    issueDate: values.issueDate || undefined,
    validUntil: values.validUntil,
    eventDates: values.eventDates.map((value) => value.trim()).filter(Boolean),
    eventLocation: values.eventLocation.trim(),
    guestCount: values.guestCount ? Number(values.guestCount) : undefined,
    durationHours: values.durationHours
      ? Number(values.durationHours)
      : undefined,
    paymentMethod: values.paymentMethod.trim(),
    advancePercentage: values.advancePercentage
      ? Number(values.advancePercentage)
      : undefined,
    notes: values.notes.trim(),
    totalAmount,
    items,
  };
}

export function calculateBudgetTotals(items: BudgetItemFormValues[]) {
  const subtotal = items.reduce((sum, item) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = toDecimal(item.unitPrice) ?? 0;
    return sum + quantity * unitPrice;
  }, 0);

  return {
    subtotal,
    total: subtotal,
  };
}
