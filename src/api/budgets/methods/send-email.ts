import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";

interface SendBudgetEmailResult {
  success: boolean;
  message: string;
  code: string;
}

export async function sendBudgetEmail(
  idBudgets: string,
): Promise<SendBudgetEmailResult> {
  const response = await httpClient.post<unknown>(
    `/api/budgets/${idBudgets}/pdf/send-email`,
    {},
  );

  return extractMutationData<SendBudgetEmailResult>(response.data);
}
