import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";
import type {
  BudgetPdfFile,
  GenerateBudgetPreviewPayload,
} from "../pdf-schema";

export async function generateBudgetPreviewPdf(
  payload: GenerateBudgetPreviewPayload,
  userId: string,
): Promise<BudgetPdfFile> {
  const response = await httpClient.post<unknown>(
    "/api/budgets/pdf/preview",
    payload,
    {
      headers: {
        "x-user-id": userId,
      },
    },
  );

  return extractMutationData<BudgetPdfFile>(response.data);
}
