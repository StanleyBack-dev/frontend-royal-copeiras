import { z } from "zod";

const nullableStringToOptional = () =>
  z.preprocess(
    (value) => (value == null ? undefined : value),
    z.string().optional(),
  );

export const contractStatusOptions = [
  "draft",
  "generated",
  "pending_signature",
  "signed",
  "rejected",
  "expired",
  "canceled",
] as const;

export const ContractSchema = z.object({
  idContracts: z.string(),
  idBudgets: z.string(),
  idLeads: nullableStringToOptional(),
  budgetNumber: z.string(),
  contractNumber: z.string(),
  status: z.enum(contractStatusOptions),
  issueDate: z.string(),
  validUntil: nullableStringToOptional(),
  effectiveDate: nullableStringToOptional(),
  expiresAt: nullableStringToOptional(),
  body: nullableStringToOptional(),
  templateVersion: z.number(),
  retentionUntil: nullableStringToOptional(),
  // Todos os campos de assinatura migrados para SignatureEntity
  sentVia: nullableStringToOptional(),
  sentAt: nullableStringToOptional(),
  notes: nullableStringToOptional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateContractPayloadSchema = z.object({
  idBudgets: z.string().uuid(),
  status: z.enum(contractStatusOptions).optional(),
  issueDate: z.string().trim().min(1),
  body: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const UpdateContractPayloadSchema = z.object({
  status: z.enum(contractStatusOptions).optional(),
  effectiveDate: z.string().optional().or(z.literal("")),
  expiresAt: z.string().optional().or(z.literal("")),
  body: z.string().optional().or(z.literal("")),
  templateVersion: z.number().int().min(1).max(99).optional(),
  // Todos os campos de assinatura migrados para SignatureEntity
  sentVia: z.string().optional().or(z.literal("")),
  sentAt: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type Contract = z.infer<typeof ContractSchema>;
export type ContractStatus = (typeof contractStatusOptions)[number];
export type CreateContractPayload = z.infer<typeof CreateContractPayloadSchema>;
export type UpdateContractPayload = z.infer<typeof UpdateContractPayloadSchema>;
