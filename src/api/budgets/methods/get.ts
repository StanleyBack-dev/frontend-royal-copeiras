import type { ListQueryParams } from "../../shared/contracts";
import { httpClient } from "../../shared/httpClient";
import { normalizeListResponse } from "../../shared/normalizers";
import type { Budget } from "../schema";

const API_BASE_URL = "/api/budgets";

export interface BudgetListQueryParams extends ListQueryParams {
  status?: string;
  startDate?: string;
  endDate?: string;
  idLeads?: string;
}

export async function getBudgets(
  userId: string,
  params: BudgetListQueryParams = {},
) {
  const response = await httpClient.get<unknown>(API_BASE_URL, {
    params,
    headers: {
      "x-user-id": userId,
    },
  });

  return normalizeListResponse<Budget>(response.data);
}
