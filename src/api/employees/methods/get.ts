import type { Employee } from "../schema";
import type { ApiListResponse, ListQueryParams } from "../../shared/contracts";
import { httpClient } from "../../shared/httpClient";
import { normalizeListResponse } from "../../shared/normalizers";

const API_BASE_URL = "/api/employees";

export async function getEmployees(
  userId: string,
  params: ListQueryParams = {},
): Promise<ApiListResponse<Employee>> {
  const response = await httpClient.get<unknown>(API_BASE_URL, {
    headers: {
      "x-user-id": userId,
    },
    params,
  });

  return normalizeListResponse<Employee>(response.data, params.limit ?? 10);
}
