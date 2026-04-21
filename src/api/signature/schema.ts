import { z } from "zod";

export const signatureStatusOptions = [
  "draft",
  "pending",
  "signed",
  "rejected",
  "cancelled",
  "expired",
  "unknown",
] as const;

export const SignatureSignerSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().optional(),
  identifier: z.string().trim().optional(),
});

export const CreateSignatureRequestPayloadSchema = z.object({
  documentName: z.string().trim().min(1).max(180),
  documentBase64: z.string().trim().min(1),
  externalReference: z.string().trim().max(120).optional(),
  signers: z.array(SignatureSignerSchema).min(1),
});

export const SignatureRequestSchema = z.object({
  requestId: z.string(),
  status: z.string(),
  providerRawStatus: z.string(),
  signatureUrl: z.string().optional(),
  completedAt: z.string().optional(),
});

export const SignatureListItemSchema = z.object({
  idSignatures: z.string(),
  idContracts: z.string(),
  contractNumber: z.string().optional(),
  contractStatus: z.string().optional(),
  provider: z.string(),
  envelopeId: z.string(),
  status: z.string(),
  signedByName: z.string().optional(),
  signedByEmail: z.string().optional(),
  signedByDocument: z.string().optional(),
  signerIp: z.string().optional(),
  signedAt: z.string().optional(),
  signatureUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type SignatureSigner = z.infer<typeof SignatureSignerSchema>;
export type CreateSignatureRequestPayload = z.infer<
  typeof CreateSignatureRequestPayloadSchema
>;
export type SignatureRequest = z.infer<typeof SignatureRequestSchema>;
export type SignatureListItem = z.infer<typeof SignatureListItemSchema>;
