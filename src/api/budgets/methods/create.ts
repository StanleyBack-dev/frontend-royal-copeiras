import type { Budget, CreateBudgetPayload } from "../schema";
import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";

const API_BASE_URL = "/api/budgets";

export async function createBudget(
  payload: CreateBudgetPayload,
  userId: string,
): Promise<Budget> {
  const response = await httpClient.post<unknown>(API_BASE_URL, payload, {
    headers: {
      "x-user-id": userId,
    },
  });

  return extractMutationData<Budget>(response.data);
}
