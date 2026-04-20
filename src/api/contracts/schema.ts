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
  signatureProvider: nullableStringToOptional(),
  signatureEnvelopeId: nullableStringToOptional(),
  signatureStatus: nullableStringToOptional(),
  signedByName: nullableStringToOptional(),
  signedByDocument: nullableStringToOptional(),
  signedByEmail: nullableStringToOptional(),
  signerIp: nullableStringToOptional(),
  signerUserAgent: nullableStringToOptional(),
  signedAt: nullableStringToOptional(),
  consentAt: nullableStringToOptional(),
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
  signatureProvider: z.string().trim().max(80).optional().or(z.literal("")),
  signatureEnvelopeId: z.string().trim().max(120).optional().or(z.literal("")),
  signatureStatus: z.string().trim().max(60).optional().or(z.literal("")),
  signedByName: z.string().trim().max(120).optional().or(z.literal("")),
  signedByDocument: z.string().trim().max(20).optional().or(z.literal("")),
  signedByEmail: z.string().trim().max(120).optional().or(z.literal("")),
  signerIp: z.string().trim().max(60).optional().or(z.literal("")),
  signerUserAgent: z.string().trim().max(255).optional().or(z.literal("")),
  signedAt: z.string().optional().or(z.literal("")),
  consentAt: z.string().optional().or(z.literal("")),
  sentVia: z.string().optional().or(z.literal("")),
  sentAt: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type Contract = z.infer<typeof ContractSchema>;
export type ContractStatus = (typeof contractStatusOptions)[number];
export type CreateContractPayload = z.infer<typeof CreateContractPayloadSchema>;
export type UpdateContractPayload = z.infer<typeof UpdateContractPayloadSchema>;
