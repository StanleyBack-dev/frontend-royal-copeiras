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

export async function getBudgets(params: BudgetListQueryParams = {}) {
  const response = await httpClient.get<unknown>(API_BASE_URL, { params });

  return normalizeListResponse<Budget>(response.data);
}

export async function getBudgetById(idBudgets: string) {
  const response = await httpClient.get<unknown>(API_BASE_URL, {
    params: { idBudgets, page: 1, limit: 1 },
  });
  const normalized = normalizeListResponse<Budget>(response.data);

  return normalized.items[0] ?? null;
}
