import { z } from "zod";
import { CreateBudgetPayloadSchema } from "./schema";

export const BudgetPdfFileSchema = z.object({
  fileName: z.string(),
  mimeType: z.string(),
  base64Content: z.string(),
  snapshotHash: z.string(),
  frozenAt: z.string().optional(),
});

export const GenerateBudgetPreviewPayloadSchema = z.object({
  budgetNumber: z.string().optional().or(z.literal("")),
  draft: CreateBudgetPayloadSchema,
});

export type BudgetPdfFile = z.infer<typeof BudgetPdfFileSchema>;
export type GenerateBudgetPreviewPayload = z.infer<
  typeof GenerateBudgetPreviewPayloadSchema
>;
