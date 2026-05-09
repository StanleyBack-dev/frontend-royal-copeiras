import type { ApiListResponse, ListQueryParams } from "../../shared/contracts";
import { httpClient } from "../../shared/httpClient";
import { normalizeListResponse } from "../../shared/normalizers";
import type { Position } from "../schema";

const API_BASE_URL = "/api/positions";

export async function getPositions(
  params: ListQueryParams & { search?: string; isActive?: boolean } = {},
): Promise<ApiListResponse<Position>> {
  const response = await httpClient.get<unknown>(API_BASE_URL, {
    params,
  });

  return normalizeListResponse<Position>(response.data, params.limit ?? 10);
}
