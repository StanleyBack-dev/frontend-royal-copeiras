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
  getDefaultIssueDate,
  getDefaultValidUntil,
} from "./form";
import { parseCurrencyInput } from "./formatters";
import {
  buildBudgetServiceDescription,
  inferBudgetServiceType,
  inferServiceGenderFromDescription,
  sanitizeBudgetServiceDescription,
  mapGenderToEnglish,
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

  // Send canonical english tokens to API
  const genderForApi = item.gender
    ? mapGenderToEnglish(item.gender)
    : undefined;

  return {
    idPositions: item.idPositions,
    description,
    gender: genderForApi,
    quantity,
    unitPrice: toDecimal(item.unitPrice) ?? 0,
    notes: "",
    sortOrder: index,
    eventDateIndex: item.eventDateIndex ?? 0,
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
  const eventLocations = budget.eventLocation?.length
    ? budget.eventLocation.map((value) => value.trim())
    : [];
  const guestCounts = budget.guestCount?.length
    ? budget.guestCount.map((value) => String(value))
    : [];
  const durationHoursPerDay = budget.durationHours?.length
    ? budget.durationHours.map((value) => String(value))
    : [];
  const discountTypesRaw = budget.discountType ?? [];
  const discountPercentagesRaw = budget.discountPercentage ?? [];
  const discountAmountsRaw = budget.discountAmount ?? [];
  const displacementFeesRaw = budget.displacementFee ?? [];
  const eventDayCount = Math.max(
    eventDates.length,
    eventArrivalTimes.length,
    eventDepartureTimes.length,
    eventLocations.length,
    guestCounts.length,
    durationHoursPerDay.length,
    discountTypesRaw.length,
    displacementFeesRaw.length,
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
    eventLocation: buildEventTimes(eventDayCount, eventLocations),
    guestCount: buildEventTimes(eventDayCount, guestCounts),
    durationHours: buildEventTimes(eventDayCount, durationHoursPerDay),
    paymentMethod:
      budget.paymentMethod &&
      budgetPaymentMethodOptions.includes(
        budget.paymentMethod as (typeof budgetPaymentMethodOptions)[number],
      )
        ? budget.paymentMethod
        : "",
    advancePercentage:
      budget.advancePercentage != null ? String(budget.advancePercentage) : "",
    discountType: buildEventTimes(
      eventDayCount,
      discountTypesRaw,
    ) as BudgetFormValues["discountType"],
    discountPercentage: Array.from({ length: eventDayCount }, (_, index) =>
      discountTypesRaw[index] === "percentage" &&
      discountPercentagesRaw[index] != null
        ? String(discountPercentagesRaw[index])
        : "",
    ),
    discountAmount: Array.from({ length: eventDayCount }, (_, index) =>
      discountTypesRaw[index] === "amount" && discountAmountsRaw[index] != null
        ? formatCurrencyFromDecimal(discountAmountsRaw[index])
        : "",
    ),
    displacementFee: Array.from({ length: eventDayCount }, (_, index) =>
      displacementFeesRaw[index] != null
        ? formatCurrencyFromDecimal(displacementFeesRaw[index])
        : "0,00",
    ),
    items: (budget.items || []).map((item) => {
      const serviceType =
        item.position || inferBudgetServiceType(item.description);

      // Prefer explicit serviceGender returned by API (english), fallback to inference from description
      const genderFromApi = item.serviceGender;
      const gender = genderFromApi
        ? genderFromApi.toString().toLowerCase() === "masculine"
          ? "Masculino"
          : genderFromApi.toString().toLowerCase() === "feminine"
            ? "Feminino"
            : ""
        : serviceType
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
        eventDateIndex: item.eventDateIndex ?? 0,
      };
    }),
  };
}

/**
 * Clones an existing budget (draft or not) into fresh, editable form values
 * for a brand-new draft — lead, event details, items and pricing carry over,
 * but the number, creation date and status reset since this is a new record,
 * and the validity window resets to a fresh one starting today. Used so a
 * correction after a contract was cancelled doesn't mean retyping the whole
 * proposal from scratch.
 */
export function mapBudgetToDuplicateFormValues(
  budget: Budget,
): BudgetFormValues {
  const issueDate = getDefaultIssueDate();

  return {
    ...mapBudgetToFormValues(budget),
    budgetNumber: "",
    createdAt: "",
    status: "draft",
    issueDate,
    validUntil: getDefaultValidUntil(issueDate),
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
  const eventLocation = values.eventLocation
    .slice(0, eventDaysCount)
    .map((value) => value.trim());
  const guestCount = values.guestCount
    .slice(0, eventDaysCount)
    .map((value) => Number(value || 0));
  const durationHours = values.durationHours
    .slice(0, eventDaysCount)
    .map((value) => Number(value || 0));
  const items = values.items.map(mapBudgetItemFormToPayload);

  const discountType = values.discountType
    .slice(0, eventDaysCount)
    .map((type) => type || "");
  const discountPercentage = discountType.map((type, index) =>
    type === "percentage" ? Number(values.discountPercentage[index] || 0) : 0,
  );
  const discountAmount = discountType.map((type, index) =>
    type === "amount"
      ? (toDecimal(values.discountAmount[index] || "") ?? 0)
      : 0,
  );
  const displacementFee = values.displacementFee
    .slice(0, eventDaysCount)
    .map((value) => toDecimal(value) ?? 0);

  const daySubtotals = Array.from({ length: eventDaysCount }, (_, day) =>
    items
      .filter((item) => item.eventDateIndex === day)
      .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
  );

  let totalAmount = 0;
  for (let day = 0; day < eventDaysCount; day += 1) {
    const baseTotal = daySubtotals[day] + (displacementFee[day] ?? 0);
    const dayDiscount =
      discountType[day] === "percentage"
        ? Math.max(
            0,
            Math.min(
              baseTotal,
              baseTotal * ((discountPercentage[day] ?? 0) / 100),
            ),
          )
        : discountType[day] === "amount"
          ? Math.max(0, Math.min(discountAmount[day] ?? 0, baseTotal))
          : 0;
    totalAmount += baseTotal - dayDiscount;
  }

  return {
    idLeads: values.idLeads.trim(),
    status: values.status,
    issueDate: values.issueDate.trim(),
    validUntil: values.validUntil.trim(),
    eventDates,
    eventArrivalTimes,
    eventDepartureTimes,
    eventLocation,
    guestCount,
    durationHours,
    paymentMethod: values.paymentMethod.trim(),
    advancePercentage: Number(values.advancePercentage || 0),
    discountPercentage,
    discountType,
    discountAmount,
    displacementFee,
    totalAmount,
    items,
  };
}

export function calculateBudgetTotals(
  items: BudgetItemFormValues[],
  displacementFee: string[] = [],
  discountPercentage: string[] = [],
  discountType: ("percentage" | "amount" | "")[] = [],
  discountAmount: string[] = [],
) {
  const dayCount = Math.max(
    displacementFee.length,
    discountType.length,
    1,
    ...items.map((item) => (item.eventDateIndex ?? 0) + 1),
  );

  const daySubtotals = Array.from({ length: dayCount }, (_, day) =>
    items
      .filter((item) => (item.eventDateIndex ?? 0) === day)
      .reduce((sum, item) => {
        const quantity = Number(item.quantity || 0);
        const unitPrice = toDecimal(item.unitPrice) ?? 0;
        return sum + quantity * unitPrice;
      }, 0),
  );

  const subtotal = daySubtotals.reduce((sum, value) => sum + value, 0);

  let totalDisplacementFee = 0;
  let totalDiscountAmount = 0;
  let total = 0;

  for (let day = 0; day < dayCount; day += 1) {
    const dayFee = toDecimal(displacementFee[day] || "") ?? 0;
    totalDisplacementFee += dayFee;

    const baseTotal = daySubtotals[day] + dayFee;
    const dayType = discountType[day] || "";

    let dayDiscount = 0;
    if (dayType === "percentage") {
      const dayPercentage = Math.min(
        Math.max(Number(discountPercentage[day] || 0), 0),
        100,
      );
      dayDiscount = dayPercentage > 0 ? baseTotal * (dayPercentage / 100) : 0;
    } else if (dayType === "amount") {
      const dayAmount = toDecimal(discountAmount[day] || "") ?? 0;
      dayDiscount = Math.max(0, Math.min(dayAmount, baseTotal));
    }

    totalDiscountAmount += dayDiscount;
    total += baseTotal - dayDiscount;
  }

  return {
    subtotal,
    displacementFee: totalDisplacementFee,
    discountAmount: totalDiscountAmount,
    total,
  };
}
