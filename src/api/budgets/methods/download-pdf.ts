import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";
import type { BudgetPdfFile } from "../pdf-schema";

export async function downloadBudgetPdf(
  idBudgets: string,
  userId: string,
): Promise<BudgetPdfFile> {
  const response = await httpClient.get<unknown>(
    `/api/budgets/${idBudgets}/pdf/download`,
    {
      headers: {
        "x-user-id": userId,
      },
    },
  );

  return extractMutationData<BudgetPdfFile>(response.data);
}
