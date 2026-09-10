import type { ApiListResponse, ListQueryParams } from "../../shared/contracts";
import { httpClient } from "../../shared/httpClient";
import { normalizeListResponse } from "../../shared/normalizers";
import type { Supply } from "../schema";

const API_BASE_URL = "/api/supplies";

export async function getSupplies(
  params: ListQueryParams & { search?: string; isActive?: boolean } = {},
): Promise<ApiListResponse<Supply>> {
  const response = await httpClient.get<unknown>(API_BASE_URL, {
    params,
  });

  return normalizeListResponse<Supply>(response.data, params.limit ?? 10);
}
