import type { Customer } from "../schema";
import type { ApiListResponse, ListQueryParams } from "../../shared/contracts";
import { httpClient } from "../../shared/httpClient";
import { normalizeListResponse } from "../../shared/normalizers";

const API_BASE_URL = "/api/customers";

export async function getCustomers(
  userId: string,
  params: ListQueryParams = {},
): Promise<ApiListResponse<Customer>> {
  const response = await httpClient.get<unknown>(API_BASE_URL, {
    headers: {
      "x-user-id": userId,
    },
    params,
  });

  return normalizeListResponse<Customer>(response.data, params.limit ?? 10);
}
