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

export const budgetStatusOptions = [
  "draft",
  "generated",
  "sent",
  "approved",
  "rejected",
  "expired",
  "canceled",
] as const;

export const BudgetItemSchema = z.object({
  idBudgetItems: z.string(),
  description: z.string().trim().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
  notes: nullableStringToEmpty(),
  sortOrder: z.number().int().min(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateBudgetItemPayloadSchema = z.object({
  description: z.string().trim().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  notes: z.string().optional().or(z.literal("")),
  sortOrder: z.number().int().min(0).optional(),
});

export const BudgetSchema = z.object({
  idBudgets: z.string(),
  idLeads: nullableStringToOptional(),
  budgetNumber: z.string(),
  status: z.enum(budgetStatusOptions),
  issueDate: z.string(),
  validUntil: z.string(),
  eventDates: z.array(z.string()),
  eventLocation: nullableStringToEmpty(),
  guestCount: nullableNumberToOptional(),
  durationHours: nullableNumberToOptional(),
  paymentMethod: nullableStringToEmpty(),
  advancePercentage: nullableNumberToOptional(),
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
  idLeads: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(budgetStatusOptions).optional(),
  issueDate: z.string().optional().or(z.literal("")),
  validUntil: z.string().min(1),
  eventDates: z.array(z.string()).optional(),
  eventLocation: z.string().optional().or(z.literal("")),
  guestCount: z.number().int().min(0).optional(),
  durationHours: z.number().int().min(1).optional(),
  paymentMethod: z.string().optional().or(z.literal("")),
  advancePercentage: z.number().min(0).max(100).optional(),
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
export type BudgetItem = z.infer<typeof BudgetItemSchema>;
export type CreateBudgetPayload = z.infer<typeof CreateBudgetPayloadSchema>;
export type UpdateBudgetPayload = z.infer<typeof UpdateBudgetPayloadSchema>;
export type CreateBudgetItemPayload = z.infer<
  typeof CreateBudgetItemPayloadSchema
>;
