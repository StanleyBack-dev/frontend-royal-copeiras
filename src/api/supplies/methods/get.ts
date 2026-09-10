import type { ApiListResponse, ListQueryParams } from "../../shared/contracts";
import { httpClient } from "../../shared/httpClient";
import { normalizeListResponse } from "../../shared/normalizers";
import type { Supply } from "../schema";

const API_BASE_URL = "/api/supplies";

export interface SupplyListQueryParams extends ListQueryParams {
  search?: string;
  isActive?: boolean;
  idSupplies?: string;
}

export async function getSupplies(
  params: SupplyListQueryParams = {},
): Promise<ApiListResponse<Supply>> {
  const response = await httpClient.get<unknown>(API_BASE_URL, {
    params,
  });

  return normalizeListResponse<Supply>(response.data, params.limit ?? 10);
}

// Fetches a single supply by id regardless of the current list page/filter.
// The BFF/BE `getSupplies` endpoint returns a one-item list when `idSupplies`
// is set, so a deep link straight onto the edit form still has its record.
export async function getSupplyById(id: string): Promise<Supply | null> {
  const response = await getSupplies({ idSupplies: id });
  return response.items[0] ?? null;
}
