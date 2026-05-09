import type {
  Budget,
  CreateBudgetPayload,
  CreateBudgetItemPayload,
} from "../../../api/budgets/schema";
import { formatDateTimeDisplay } from "../../../utils/format";
import type { BudgetFormValues, BudgetItemFormValues } from "./form";
import {
  buildEventDates,
  buildEventTimes,
  budgetPaymentMethodOptions,
} from "./form";
import { parseCurrencyInput } from "./formatters";
import {
  buildBudgetServiceDescription,
  inferBudgetServiceType,
  inferServiceGenderFromDescription,
  sanitizeBudgetServiceDescription,
} from "./service-items";

function formatCurrencyFromDecimal(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function toDecimal(value: string): number | undefined {
  return parseCurrencyInput(value);
}

function mapBudgetItemFormToPayload(
  item: BudgetItemFormValues,
  index: number,
): CreateBudgetItemPayload {
  const quantity = Number(item.quantity || 0);
  const effectiveGender =
    item.serviceType && item.gender ? item.gender : undefined;
  const description = item.serviceType
    ? buildBudgetServiceDescription(item.serviceType, quantity, effectiveGender)
    : item.description.trim();

  return {
    idPositions: item.idPositions,
    description,
    quantity,
    unitPrice: toDecimal(item.unitPrice) ?? 0,
    notes: "",
    sortOrder: index,
  };
}

export function mapBudgetToFormValues(budget: Budget): BudgetFormValues {
  const eventDates = budget.eventDates?.length
    ? budget.eventDates.map((value) => value.slice(0, 10))
    : [""];
  const eventArrivalTimes = budget.eventArrivalTimes?.length
    ? budget.eventArrivalTimes.map((value) => value.trim())
    : [];
  const eventDepartureTimes = budget.eventDepartureTimes?.length
    ? budget.eventDepartureTimes.map((value) => value.trim())
    : [];
  const eventDayCount = Math.max(
    eventDates.length,
    eventArrivalTimes.length,
    eventDepartureTimes.length,
    1,
  );

  return {
    budgetNumber: budget.budgetNumber,
    createdAt: formatDateTimeDisplay(budget.createdAt),
    idLeads: budget.idLeads || "",
    status: budget.status,
    issueDate: budget.issueDate.slice(0, 10),
    validUntil: budget.validUntil.slice(0, 10),
    eventDateMode: eventDayCount > 1 ? "multiple" : "single",
    eventDaysCount: String(eventDayCount),
    eventDates: buildEventDates(eventDayCount, eventDates),
    eventArrivalTimes: buildEventTimes(eventDayCount, eventArrivalTimes),
    eventDepartureTimes: buildEventTimes(eventDayCount, eventDepartureTimes),
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
    discountPercentage:
      budget.discountPercentage != null
        ? String(budget.discountPercentage)
        : "",
    discountType: budget.discountType || "",
    discountAmount:
      budget.discountAmount != null && budget.discountAmount >= 0
        ? formatCurrencyFromDecimal(budget.discountAmount)
        : "",
    displacementFee:
      budget.displacementFee != null && budget.displacementFee >= 0
        ? formatCurrencyFromDecimal(budget.displacementFee)
        : "0,00",
    items: (budget.items || []).map((item) => {
      const serviceType =
        item.position || inferBudgetServiceType(item.description);
      const gender = serviceType
        ? inferServiceGenderFromDescription(item.description, serviceType)
        : "";

      return {
        id: item.idBudgetItems,
        idPositions: item.idPositions || "",
        serviceType,
        gender,
        description: serviceType
          ? buildBudgetServiceDescription(
              serviceType,
              item.quantity,
              gender || undefined,
            )
          : sanitizeBudgetServiceDescription(item.description),
        quantity: String(item.quantity),
        unitPrice: formatCurrencyFromDecimal(item.unitPrice),
      };
    }),
  };
}

export function mapBudgetFormToPayload(
  values: BudgetFormValues,
): CreateBudgetPayload {
  const eventDaysCount =
    values.eventDateMode === "multiple" ? Number(values.eventDaysCount) : 1;
  const eventDates = values.eventDates
    .slice(0, eventDaysCount)
    .map((value) => value.trim());
  const eventArrivalTimes = values.eventArrivalTimes
    .slice(0, eventDaysCount)
    .map((value) => value.trim());
  const eventDepartureTimes = values.eventDepartureTimes
    .slice(0, eventDaysCount)
    .map((value) => value.trim());
  const items = values.items.map(mapBudgetItemFormToPayload);
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const displacementFeeValue = toDecimal(values.displacementFee) ?? 0;

  const discountType = values.discountType || null;
  const discountPercentage =
    values.discountType === "percentage" && values.discountPercentage
      ? Number(values.discountPercentage)
      : undefined;
  const discountAmountValue =
    values.discountType === "amount" && values.discountAmount
      ? toDecimal(values.discountAmount)
      : undefined;

  const baseTotal = subtotal + displacementFeeValue;
  const resolvedDiscountAmount =
    discountType === "percentage"
      ? Math.max(
          0,
          Math.min(baseTotal, baseTotal * ((discountPercentage ?? 0) / 100)),
        )
      : discountType === "amount"
        ? Math.max(0, Math.min(discountAmountValue ?? 0, baseTotal))
        : 0;
  const totalAmount = baseTotal - resolvedDiscountAmount;

  return {
    idLeads: values.idLeads.trim(),
    status: values.status,
    issueDate: values.issueDate.trim(),
    validUntil: values.validUntil.trim(),
    eventDates,
    eventArrivalTimes,
    eventDepartureTimes,
    eventLocation: values.eventLocation.trim(),
    guestCount: Number(values.guestCount || 0),
    durationHours: Number(values.durationHours || 0),
    paymentMethod: values.paymentMethod.trim(),
    advancePercentage: Number(values.advancePercentage || 0),
    discountPercentage,
    discountType,
    discountAmount: discountAmountValue,
    displacementFee: displacementFeeValue,
    totalAmount,
    items,
  };
}

export function calculateBudgetTotals(
  items: BudgetItemFormValues[],
  displacementFee = "",
  discountPercentage = "",
  discountType: "percentage" | "amount" | "" = "",
  discountAmount = "",
) {
  const subtotal = items.reduce((sum, item) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = toDecimal(item.unitPrice) ?? 0;
    return sum + quantity * unitPrice;
  }, 0);

  const displacementFeeValue = toDecimal(displacementFee) ?? 0;
  const baseTotal = subtotal + displacementFeeValue;

  let calculatedDiscountAmount = 0;

  if (discountType === "percentage") {
    const discountPercentageValue = Math.min(
      Math.max(Number(discountPercentage || 0), 0),
      100,
    );
    calculatedDiscountAmount =
      discountPercentageValue > 0
        ? baseTotal * (discountPercentageValue / 100)
        : 0;
  } else if (discountType === "amount") {
    const discountAmountValue = toDecimal(discountAmount) ?? 0;
    calculatedDiscountAmount = Math.max(
      0,
      Math.min(discountAmountValue, baseTotal),
    );
  }

  return {
    subtotal,
    displacementFee: displacementFeeValue,
    discountAmount: calculatedDiscountAmount,
    total: baseTotal - calculatedDiscountAmount,
  };
}
