import { z } from "zod";

const nullableStringToOptional = () =>
  z.preprocess(
    (value) => (value == null ? undefined : value),
    z.string().optional(),
  );

const nullableStringToEmpty = () =>
  z.preprocess(
    (value) => (value == null ? "" : value),
    z.string().optional().or(z.literal("")),
  );

const nullableNumberToOptional = () =>
  z.preprocess(
    (value) => (value == null ? undefined : value),
    z.number().optional(),
  );

const stringTrimmed = (minLength = 0) =>
  z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z.string().min(minLength),
  );

const UUID_CANONICAL_PATTERN =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const uuidCanonicalString = () =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.string().regex(UUID_CANONICAL_PATTERN, "Invalid UUID"),
  );

export const budgetStatusOptions = [
  "draft",
  "generated",
  "sent",
  "approved",
  "rejected",
  "expired",
  "canceled",
] as const;

export const budgetItemTypeOptions = ["LABOR", "SUPPLY"] as const;

export const BudgetItemSchema = z.object({
  idBudgetItems: z.string(),
  itemType: z.preprocess(
    (value) => (value == null ? "LABOR" : value),
    z.enum(budgetItemTypeOptions).default("LABOR"),
  ),
  idPositions: nullableStringToOptional(),
  position: nullableStringToOptional(),
  idSupplies: nullableStringToOptional(),
  supply: nullableStringToOptional(),
  unit: nullableStringToOptional(),
  description: stringTrimmed(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
  notes: nullableStringToEmpty(),
  sortOrder: z.number().int().min(0),
  eventDateIndex: z.preprocess(
    (value) => (value == null ? 0 : value),
    z.number().int().min(0).default(0),
  ),
  serviceGender: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateBudgetItemPayloadSchema = z.object({
  // LABOR items carry a cargo (idPositions); SUPPLY items carry an optional
  // catalog id (idSupplies) + a free unit label. Cross-field validity is
  // enforced by the backend validator.
  itemType: z.enum(budgetItemTypeOptions).default("LABOR"),
  idPositions: uuidCanonicalString().optional(),
  idSupplies: uuidCanonicalString().optional(),
  unit: z.string().trim().max(32).optional().or(z.literal("")),
  description: stringTrimmed(1),
  // Accept both Portuguese and canonical english tokens
  gender: z.enum(["Masculino", "Feminino", "masculine", "feminine"]).optional(),
  // Allow quantity as string or number from form inputs
  quantity: z.preprocess((val) => {
    if (typeof val === "string")
      return Number(val.replace(/\./g, "").replace(",", "."));
    return val;
  }, z.number().int().min(1)),
  // Accept unitPrice as string (e.g., "1.234,56") or number
  unitPrice: z.preprocess((val) => {
    if (typeof val === "string") {
      const normalized = val.replace(/\./g, "").replace(",", ".").trim();
      const n = Number(normalized);
      return Number.isNaN(n) ? undefined : n;
    }
    return val;
  }, z.number().min(0)),
  notes: z.string().optional().or(z.literal("")),
  sortOrder: z.number().int().min(0).optional(),
  eventDateIndex: z.number().int().min(0).default(0),
});

export const BudgetSchema = z.object({
  idBudgets: z.string(),
  idLeads: nullableStringToOptional(),
  budgetNumber: z.string(),
  status: z.enum(budgetStatusOptions),
  issueDate: z.string(),
  validUntil: z.string(),
  eventDates: z.preprocess(
    (value) => (value == null ? [] : value),
    z.array(z.string()).optional(),
  ),
  eventArrivalTimes: z.preprocess(
    (value) => (value == null ? [] : value),
    z.array(z.string()).optional(),
  ),
  eventDepartureTimes: z.preprocess(
    (value) => (value == null ? [] : value),
    z.array(z.string()).optional(),
  ),
  eventLocation: z.preprocess(
    (value) => (value == null ? [] : value),
    z.array(z.string()).optional(),
  ),
  guestCount: z.preprocess(
    (value) => (value == null ? [] : value),
    z.array(z.number()).optional(),
  ),
  durationHours: z.preprocess(
    (value) => (value == null ? [] : value),
    z.array(z.number()).optional(),
  ),
  paymentMethod: nullableStringToEmpty(),
  advancePercentage: nullableNumberToOptional(),
  discountPercentage: z.preprocess(
    (value) => (value == null ? [] : value),
    z.array(z.number()).optional(),
  ),
  discountType: z.preprocess(
    (value) => (value == null ? [] : value),
    z.array(z.string()).optional(),
  ),
  discountAmount: z.preprocess(
    (value) => (value == null ? [] : value),
    z.array(z.number()).optional(),
  ),
  displacementFee: z.preprocess(
    (value) => (value == null ? [] : value),
    z.array(z.number()).optional(),
  ),
  subtotal: z.number(),
  totalAmount: z.number(),
  sentVia: nullableStringToOptional(),
  sentAt: nullableStringToOptional(),
  items: z.preprocess(
    (value) => (value == null ? [] : value),
    z.array(BudgetItemSchema).optional(),
  ),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateBudgetPayloadSchema = z.object({
  idLeads: z.string().uuid(),
  status: z.enum(budgetStatusOptions).optional(),
  issueDate: z.string().min(1),
  validUntil: z.string().min(1),
  eventDates: z.array(z.string()).min(1),
  eventArrivalTimes: z.array(z.string()).min(1),
  eventDepartureTimes: z.array(z.string()).min(1),
  eventLocation: z.array(stringTrimmed(1)).min(1),
  guestCount: z.array(z.number().int().min(1)).min(1),
  durationHours: z.array(z.number().int().min(1).max(24)).min(1),
  paymentMethod: stringTrimmed(1),
  advancePercentage: z.number().min(0).max(100),
  discountPercentage: z.array(z.number().min(0).max(100)).optional(),
  discountType: z.array(z.enum(["", "percentage", "amount"])).optional(),
  discountAmount: z.array(z.number().min(0)).optional(),
  displacementFee: z.array(z.number().min(0)).optional(),
  totalAmount: z.number().min(0).optional(),
  items: z.array(CreateBudgetItemPayloadSchema).min(1),
});

export const UpdateBudgetPayloadSchema =
  CreateBudgetPayloadSchema.partial().extend({
    sentVia: nullableStringToOptional(),
    sentAt: nullableStringToOptional(),
  });

export type Budget = z.infer<typeof BudgetSchema>;
export type BudgetStatus = (typeof budgetStatusOptions)[number];
export type BudgetItemType = (typeof budgetItemTypeOptions)[number];
export type BudgetItem = z.infer<typeof BudgetItemSchema>;
export type CreateBudgetPayload = z.infer<typeof CreateBudgetPayloadSchema>;
export type UpdateBudgetPayload = z.infer<typeof UpdateBudgetPayloadSchema>;
export type CreateBudgetItemPayload = z.infer<
  typeof CreateBudgetItemPayloadSchema
>;
