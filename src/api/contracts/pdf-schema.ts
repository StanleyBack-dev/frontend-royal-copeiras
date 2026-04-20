import { z } from "zod";

export const ContractPdfFileSchema = z.object({
  fileName: z.string(),
  mimeType: z.string(),
  base64Content: z.string(),
  snapshotHash: z.string(),
});

export const GenerateContractPreviewPayloadSchema = z.object({
  idContracts: z.string().uuid(),
});

export type ContractPdfFile = z.infer<typeof ContractPdfFileSchema>;
export type GenerateContractPreviewPayload = z.infer<
  typeof GenerateContractPreviewPayloadSchema
>;
