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
  budgetServiceTypeOptions,
  type BudgetServiceType,
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

export interface BudgetItemFormValues {
  id?: string;
  serviceType: BudgetServiceType | "";
  description: string;
  quantity: string;
  unitPrice: string;
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
  eventLocation: string;
  guestCount: string;
  durationHours: string;
  paymentMethod: string;
  advancePercentage: string;
  displacementFee: string;
  items: BudgetItemFormValues[];
}

export const emptyBudgetItemFormValues: BudgetItemFormValues = {
  serviceType: "",
  description: "",
  quantity: "1",
  unitPrice: "",
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
    eventLocation: "",
    guestCount: "",
    durationHours: "",
    paymentMethod: "",
    advancePercentage: "30",
    displacementFee: "0,00",
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
  eventLocation: z
    .string()
    .trim()
    .min(1, budgetValidationMessages.eventLocationRequired),
  guestCount: z
    .string()
    .trim()
    .min(1, budgetValidationMessages.guestCountRequired),
  durationHours: z
    .string()
    .trim()
    .min(1, budgetValidationMessages.durationRequired),
  paymentMethod: z
    .string()
    .trim()
    .min(1, budgetValidationMessages.paymentMethodRequired),
  advancePercentage: z
    .string()
    .trim()
    .min(1, budgetValidationMessages.advancePercentageRequired),
  displacementFee: z.string().trim(),
  items: z.array(
    z.object({
      id: z.string().optional(),
      serviceType: z.enum(budgetServiceTypeOptions).or(z.literal("")),
      description: z.string(),
      quantity: z.string(),
      unitPrice: z.string(),
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

    if (Number(data.guestCount) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["guestCount"],
        message: budgetValidationMessages.guestCountInvalid,
      });
    }

    const durationHours = Number(data.durationHours);

    if (
      !Number.isInteger(durationHours) ||
      durationHours < 1 ||
      durationHours > BUDGET_DURATION_HOURS_MAX
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

    if (data.items.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: budgetValidationMessages.itemsRequired,
      });
      return;
    }

    if (data.items.some((item) => !item.description.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: budgetValidationMessages.itemDescriptionRequired,
      });
    }

    if (data.items.some((item) => !item.serviceType.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: budgetValidationMessages.itemServiceTypeRequired,
      });
    }

    const selectedTypes = data.items
      .map((item) => item.serviceType.trim())
      .filter(Boolean);
    const uniqueTypes = new Set(selectedTypes);

    if (selectedTypes.length !== uniqueTypes.size) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: budgetValidationMessages.itemServiceTypeDuplicated,
      });
    }

    if (data.items.some((item) => Number(item.quantity) <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: budgetValidationMessages.itemQuantityInvalid,
      });
    }

    if (data.items.some((item) => !item.unitPrice.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: budgetValidationMessages.itemUnitPriceInvalid,
      });
    }

    const displacementFeeDigits = data.displacementFee.replace(/[^\d]/g, "");
    const displacementFeeValue = displacementFeeDigits
      ? Number(displacementFeeDigits) / 100
      : 0;

    if (!Number.isFinite(displacementFeeValue) || displacementFeeValue < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["displacementFee"],
        message: budgetValidationMessages.displacementFeeInvalid,
      });
    }
  },
);
