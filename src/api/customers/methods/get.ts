import type { Customer } from "../schema";
import type { ApiListResponse, ListQueryParams } from "../../shared/contracts";
import { httpClient } from "../../shared/httpClient";
import { normalizeListResponse } from "../../shared/normalizers";

const API_BASE_URL = "/api/customers";

export interface CustomerListQueryParams extends ListQueryParams {
  idCustomers?: string;
}

export async function getCustomers(
  params: CustomerListQueryParams = {},
): Promise<ApiListResponse<Customer>> {
  const response = await httpClient.get<unknown>(API_BASE_URL, { params });

  return normalizeListResponse<Customer>(response.data, params.limit ?? 10);
}

// Fetches a single customer by id regardless of the current list page/filter.
// The BFF/BE `getCustomers` endpoint returns a one-item list when `idCustomers`
// is set, so a deep link straight onto the edit form still has its record.
export async function getCustomerById(id: string): Promise<Customer | null> {
  const response = await getCustomers({ idCustomers: id });
  return response.items[0] ?? null;
}
