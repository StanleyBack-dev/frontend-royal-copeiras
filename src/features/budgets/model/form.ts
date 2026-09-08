import { z } from "zod";
import type { BudgetStatus } from "../../../api/budgets/schema";
import {
  BUDGET_ADVANCE_PERCENTAGE_STEP,
  BUDGET_DEFAULT_VALIDITY_DAYS,
  BUDGET_DURATION_HOURS_MAX,
  BUDGET_EVENT_MAX_DAYS,
} from "./constants";
import { budgetValidationMessages } from "./messages";
import {
  serviceGenderOptions,
  type BudgetServiceType,
  type ServiceGenderOption,
} from "./service-items";

export const budgetEventDateModeOptions = ["single", "multiple"] as const;
export const budgetPaymentMethodOptions = [
  "PIX",
  "Boleto",
  "Cartão de Crédito",
  "Cartão de Débito",
  "Transferência Bancária",
  "Dinheiro",
] as const;
export const budgetDiscountTypeOptions = ["percentage", "amount"] as const;
const EVENT_TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export function toIsoDateString(date = new Date()) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

export function addDaysToIsoDate(dateValue: string, days: number) {
  const [year, month, day] = dateValue.split("-").map(Number);

  if (!year || !month || !day) {
    return "";
  }

  const nextDate = new Date(year, month - 1, day);
  nextDate.setDate(nextDate.getDate() + days);
  return toIsoDateString(nextDate);
}

export function getDefaultIssueDate() {
  return toIsoDateString();
}

export function getDefaultValidUntil(issueDate = getDefaultIssueDate()) {
  return addDaysToIsoDate(issueDate, BUDGET_DEFAULT_VALIDITY_DAYS);
}

export function buildEventDates(count: number, existingDates: string[] = []) {
  return Array.from(
    { length: count },
    (_, index) => existingDates[index] || "",
  );
}

export function buildEventTimes(count: number, existingTimes: string[] = []) {
  return Array.from(
    { length: count },
    (_, index) => existingTimes[index] || "",
  );
}

export const budgetDurationOptions = Array.from(
  { length: BUDGET_DURATION_HOURS_MAX },
  (_, index) => {
    const hours = index + 1;

    return {
      value: String(hours),
      label: `${padDatePart(hours)}:00`,
    };
  },
);

export const budgetAdvancePercentageOptions = Array.from(
  { length: 100 / BUDGET_ADVANCE_PERCENTAGE_STEP + 1 },
  (_, index) => {
    const percentage = index * BUDGET_ADVANCE_PERCENTAGE_STEP;

    return {
      value: String(percentage),
      label: `${percentage}%`,
    };
  },
);

export const budgetDiscountPercentageOptions = Array.from(
  { length: 100 / BUDGET_ADVANCE_PERCENTAGE_STEP },
  (_, index) => {
    const percentage = (index + 1) * BUDGET_ADVANCE_PERCENTAGE_STEP;

    return {
      value: String(percentage),
      label: `${percentage}%`,
    };
  },
);

export interface BudgetItemFormValues {
  id?: string;
  idPositions: string;
  serviceType: BudgetServiceType | "";
  gender: ServiceGenderOption | "";
  description: string;
  quantity: string;
  unitPrice: string;
  eventDateIndex: number;
}

export interface BudgetFormValues {
  budgetNumber: string;
  createdAt: string;
  idLeads: string;
  status: BudgetStatus;
  issueDate: string;
  validUntil: string;
  eventDateMode: (typeof budgetEventDateModeOptions)[number];
  eventDaysCount: string;
  eventDates: string[];
  eventArrivalTimes: string[];
  eventDepartureTimes: string[];
  eventLocation: string[];
  guestCount: string[];
  durationHours: string[];
  paymentMethod: string;
  advancePercentage: string;
  discountPercentage: string[];
  discountType: ("percentage" | "amount" | "")[];
  discountAmount: string[];
  displacementFee: string[];
  items: BudgetItemFormValues[];
}

export const emptyBudgetItemFormValues: BudgetItemFormValues = {
  idPositions: "",
  serviceType: "",
  gender: "",
  description: "",
  quantity: "1",
  unitPrice: "",
  eventDateIndex: 0,
};

export function createEmptyBudgetFormValues(
  initialLeadId = "",
): BudgetFormValues {
  const issueDate = getDefaultIssueDate();

  return {
    budgetNumber: "",
    createdAt: "",
    idLeads: initialLeadId,
    status: "draft",
    issueDate,
    validUntil: getDefaultValidUntil(issueDate),
    eventDateMode: "single",
    eventDaysCount: "1",
    eventDates: [""],
    eventArrivalTimes: [""],
    eventDepartureTimes: [""],
    eventLocation: [""],
    guestCount: [""],
    durationHours: [""],
    paymentMethod: "PIX",
    advancePercentage: "30",
    discountPercentage: [""],
    discountType: [""],
    discountAmount: [""],
    displacementFee: ["0,00"],
    items: [{ ...emptyBudgetItemFormValues }],
  };
}

export const emptyBudgetFormValues: BudgetFormValues =
  createEmptyBudgetFormValues();

const budgetFormSchemaBase = z.object({
  budgetNumber: z.string(),
  createdAt: z.string(),
  idLeads: z.string().trim().min(1, budgetValidationMessages.leadRequired),
  status: z.custom<BudgetStatus>(),
  issueDate: z
    .string()
    .trim()
    .min(1, budgetValidationMessages.issueDateRequired),
  validUntil: z
    .string()
    .trim()
    .min(1, budgetValidationMessages.validUntilRequired),
  eventDateMode: z.enum(budgetEventDateModeOptions),
  eventDaysCount: z.string(),
  eventDates: z.array(z.string()),
  eventArrivalTimes: z.array(z.string()),
  eventDepartureTimes: z.array(z.string()),
  eventLocation: z.array(z.string()),
  guestCount: z.array(z.string()),
  durationHours: z.array(z.string()),
  paymentMethod: z
    .string()
    .trim()
    .min(1, budgetValidationMessages.paymentMethodRequired),
  advancePercentage: z
    .string()
    .trim()
    .min(1, budgetValidationMessages.advancePercentageRequired),
  discountPercentage: z.array(z.string()),
  discountType: z.array(
    z.enum(budgetDiscountTypeOptions).or(z.literal("")),
  ),
  discountAmount: z.array(z.string()),
  displacementFee: z.array(z.string()),
  items: z.array(
    z.object({
      id: z.string().optional(),
      idPositions: z
        .string()
        .trim()
        .min(1, budgetValidationMessages.itemServiceTypeRequired),
      serviceType: z.string(),
      gender: z.enum(serviceGenderOptions).or(z.literal("")),
      description: z
        .string()
        .trim()
        .min(1, budgetValidationMessages.itemDescriptionRequired),
      quantity: z
        .string()
        .trim()
        .min(1, budgetValidationMessages.itemQuantityInvalid),
      unitPrice: z
        .string()
        .trim()
        .min(1, budgetValidationMessages.itemUnitPriceInvalid),
      eventDateIndex: z.number().int().min(0),
    }),
  ),
});

export const budgetFormSchema = budgetFormSchemaBase.superRefine(
  (data, ctx) => {
    if (data.validUntil && data.issueDate && data.validUntil < data.issueDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["validUntil"],
        message: budgetValidationMessages.validUntilAfterIssueDate,
      });
    }

    const eventDatesCount =
      data.eventDateMode === "multiple"
        ? Math.min(
            Math.max(Number(data.eventDaysCount || 2), 2),
            BUDGET_EVENT_MAX_DAYS,
          )
        : 1;

    const selectedEventDates = data.eventDates.slice(0, eventDatesCount);

    if (
      selectedEventDates.length !== eventDatesCount ||
      selectedEventDates.some(
        (eventDate) => !/^\d{4}-\d{2}-\d{2}$/.test(eventDate),
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["eventDates"],
        message: budgetValidationMessages.eventDateRequired,
      });
    }

    const selectedEventArrivalTimes = data.eventArrivalTimes.slice(
      0,
      eventDatesCount,
    );

    if (
      selectedEventArrivalTimes.length !== eventDatesCount ||
      selectedEventArrivalTimes.some(
        (eventTime) => !EVENT_TIME_PATTERN.test(eventTime),
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["eventArrivalTimes"],
        message: budgetValidationMessages.eventArrivalTimeRequired,
      });
    }

    const selectedEventDepartureTimes = data.eventDepartureTimes.slice(
      0,
      eventDatesCount,
    );

    if (
      selectedEventDepartureTimes.length !== eventDatesCount ||
      selectedEventDepartureTimes.some(
        (eventTime) => !EVENT_TIME_PATTERN.test(eventTime),
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["eventDepartureTimes"],
        message: budgetValidationMessages.eventDepartureTimeRequired,
      });
    }

    const selectedEventLocations = data.eventLocation.slice(0, eventDatesCount);

    if (
      selectedEventLocations.length !== eventDatesCount ||
      selectedEventLocations.some((location) => !location.trim())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["eventLocation"],
        message: budgetValidationMessages.eventLocationRequired,
      });
    }

    const selectedGuestCounts = data.guestCount.slice(0, eventDatesCount);

    if (
      selectedGuestCounts.length !== eventDatesCount ||
      selectedGuestCounts.some((value) => !(Number(value) > 0))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["guestCount"],
        message: budgetValidationMessages.guestCountInvalid,
      });
    }

    const selectedDurationHours = data.durationHours.slice(0, eventDatesCount);

    if (
      selectedDurationHours.length !== eventDatesCount ||
      selectedDurationHours.some((value) => {
        const hours = Number(value);
        return (
          !Number.isInteger(hours) ||
          hours < 1 ||
          hours > BUDGET_DURATION_HOURS_MAX
        );
      })
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["durationHours"],
        message: budgetValidationMessages.durationRequired,
      });
    }

    const advancePercentage = Number(data.advancePercentage);

    if (
      !Number.isFinite(advancePercentage) ||
      advancePercentage < 0 ||
      advancePercentage > 100
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["advancePercentage"],
        message: budgetValidationMessages.advancePercentageInvalid,
      });
    }

    const selectedDiscountType = data.discountType.slice(0, eventDatesCount);
    const selectedDiscountPercentage = data.discountPercentage.slice(
      0,
      eventDatesCount,
    );
    const selectedDiscountAmount = data.discountAmount.slice(
      0,
      eventDatesCount,
    );

    for (let day = 0; day < eventDatesCount; day += 1) {
      const dayType = selectedDiscountType[day] ?? "";

      if (dayType === "percentage") {
        const percentage = Number(selectedDiscountPercentage[day] || 0);

        if (
          !selectedDiscountPercentage[day] ||
          !Number.isFinite(percentage) ||
          percentage <= 0 ||
          percentage > 100
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["discountPercentage"],
            message: budgetValidationMessages.discountPercentageRequired,
          });
        }
      }

      if (dayType === "amount") {
        const amountDigits = (selectedDiscountAmount[day] || "").replace(
          /[^\d]/g,
          "",
        );
        const amountValue = amountDigits ? Number(amountDigits) / 100 : 0;

        if (
          !amountDigits ||
          !Number.isFinite(amountValue) ||
          amountValue <= 0
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["discountAmount"],
            message: budgetValidationMessages.discountAmountRequired,
          });
        }
      }
    }

    if (data.items.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: budgetValidationMessages.itemsRequired,
      });
      return;
    }

    const coveredDays = new Set(
      data.items.map((item) => item.eventDateIndex ?? 0),
    );
    if (coveredDays.size < eventDatesCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: budgetValidationMessages.dayMissingItems,
      });
    }

    // Validate uniqueness of position + gender combinations within the same day
    const selectedCombos = data.items.map(
      (item) =>
        `${item.eventDateIndex ?? 0}:${item.idPositions.trim()}:${item.gender.trim()}`,
    );
    const uniqueCombos = new Set(selectedCombos);

    if (selectedCombos.length !== uniqueCombos.size) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: budgetValidationMessages.itemServiceTypeDuplicated,
      });
    }

    // Validate quantity is positive
    if (data.items.some((item) => Number(item.quantity) <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: budgetValidationMessages.itemQuantityInvalid,
      });
    }

    const selectedDisplacementFee = data.displacementFee.slice(
      0,
      eventDatesCount,
    );

    if (
      selectedDisplacementFee.length !== eventDatesCount ||
      selectedDisplacementFee.some((value) => {
        const digits = (value || "").replace(/[^\d]/g, "");
        const amount = digits ? Number(digits) / 100 : 0;
        return !Number.isFinite(amount) || amount < 0;
      })
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["displacementFee"],
        message: budgetValidationMessages.displacementFeeInvalid,
      });
    }
  },
);
