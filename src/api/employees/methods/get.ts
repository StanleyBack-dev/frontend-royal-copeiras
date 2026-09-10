import type { Employee } from "../schema";
import type { ApiListResponse, ListQueryParams } from "../../shared/contracts";
import { httpClient } from "../../shared/httpClient";
import { normalizeListResponse } from "../../shared/normalizers";

const API_BASE_URL = "/api/employees";

export interface EmployeeListQueryParams extends ListQueryParams {
  idEmployees?: string;
}

export async function getEmployees(
  params: EmployeeListQueryParams = {},
): Promise<ApiListResponse<Employee>> {
  const response = await httpClient.get<unknown>(API_BASE_URL, { params });

  return normalizeListResponse<Employee>(response.data, params.limit ?? 10);
}

// Fetches a single employee by id regardless of the current list page/filter.
// The BFF/BE `getEmployees` endpoint returns a one-item list when `idEmployees`
// is set, so a deep link straight onto the edit form still has its record.
export async function getEmployeeById(id: string): Promise<Employee | null> {
  const response = await getEmployees({ idEmployees: id });
  return response.items[0] ?? null;
}
