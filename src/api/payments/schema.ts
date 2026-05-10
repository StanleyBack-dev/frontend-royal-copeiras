import { z } from "zod";

const nullableStringToOptional = () =>
  z.preprocess(
    (value) => (value == null ? undefined : value),
    z.string().optional(),
  );

const nullableNumberToOptional = () =>
  z.preprocess(
    (value) => (value == null ? undefined : value),
    z.number().optional(),
  );

export const paymentStatusOptions = [
  "pendente",
  "parcial",
  "pago",
  "cancelado",
] as const;

export const paymentOriginOptions = [
  "budget_advance",
  "budget_total",
  "contract",
  "material",
  "overtime",
] as const;

export const PaymentItemSchema = z.object({
  idPaymentItems: z.string(),
  idPayments: z.string(),
  origin: z.enum(paymentOriginOptions),
  status: z.enum(paymentStatusOptions),
  plannedAmount: z.number().min(0),
  paidAmount: nullableNumberToOptional(),
  paymentDate: nullableStringToOptional(),
  dueDate: nullableStringToOptional(),
  proofUrl: nullableStringToOptional(),
  notes: nullableStringToOptional(),
  sortOrder: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const PaymentSchema = z.object({
  idPayments: z.string(),
  idUsers: z.string(),
  idLeads: nullableStringToOptional(),
  idBudgets: nullableStringToOptional(),
  idContracts: nullableStringToOptional(),
  idEvents: nullableStringToOptional(),
  idEmployees: nullableStringToOptional(),
  origin: z.enum(paymentOriginOptions),
  status: z.enum(paymentStatusOptions),
  plannedAmount: z.number().min(0),
  paidAmount: nullableNumberToOptional(),
  paymentDate: nullableStringToOptional(),
  dueDate: nullableStringToOptional(),
  proofUrl: nullableStringToOptional(),
  notes: nullableStringToOptional(),
  paymentItems: z.array(PaymentItemSchema).optional().default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreatePaymentItemPayloadSchema = z.object({
  origin: z.enum(paymentOriginOptions),
  plannedAmount: z.number().min(0.01),
  status: z.enum(paymentStatusOptions),
  paidAmount: z.number().min(0),
  paymentDate: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  proofUrl: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  sortOrder: z.number().optional(),
});

export const CreatePaymentPayloadSchema = z.object({
  idLeads: z.string().uuid(),
  idBudgets: z.string().uuid().optional(),
  idContracts: z.string().uuid().optional(),
  idEvents: z.string().uuid().optional(),
  idEmployees: z.string().uuid().optional(),
  origin: z.enum(paymentOriginOptions).optional(),
  plannedAmount: z.number().min(0.01).optional(),
  dueDate: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  paymentItems: z.array(CreatePaymentItemPayloadSchema).min(1),
});

export const UpdatePaymentPayloadSchema = z.object({
  status: z.enum(paymentStatusOptions).optional(),
  paidAmount: z.number().min(0).optional(),
  paymentDate: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  proofUrl: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  paymentItems: z.array(CreatePaymentItemPayloadSchema).min(1).optional(),
});

export type Payment = z.infer<typeof PaymentSchema>;
export type PaymentItem = z.infer<typeof PaymentItemSchema>;
export type PaymentStatus = (typeof paymentStatusOptions)[number];
export type PaymentOrigin = (typeof paymentOriginOptions)[number];
export type CreatePaymentItemPayload = z.infer<
  typeof CreatePaymentItemPayloadSchema
>;
export type CreatePaymentPayload = z.infer<typeof CreatePaymentPayloadSchema>;
export type UpdatePaymentPayload = z.infer<typeof UpdatePaymentPayloadSchema>;
