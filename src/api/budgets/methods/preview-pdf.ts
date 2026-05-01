import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";
import type {
  BudgetPdfFile,
  GenerateBudgetPreviewPayload,
} from "../pdf-schema";

export async function generateBudgetPreviewPdf(
  payload: GenerateBudgetPreviewPayload,
): Promise<BudgetPdfFile> {
  const response = await httpClient.post<unknown>(
    "/api/budgets/pdf/preview",
    payload,
  );

  return extractMutationData<BudgetPdfFile>(response.data);
}
