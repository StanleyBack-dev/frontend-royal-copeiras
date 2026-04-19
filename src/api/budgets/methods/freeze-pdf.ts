import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";
import type { BudgetPdfFile } from "../pdf-schema";

export async function freezeBudgetPdf(
  idBudgets: string,
  userId: string,
): Promise<BudgetPdfFile> {
  const response = await httpClient.post<unknown>(
    `/api/budgets/${idBudgets}/pdf/freeze`,
    {},
    {
      headers: {
        "x-user-id": userId,
      },
    },
  );

  return extractMutationData<BudgetPdfFile>(response.data);
}
