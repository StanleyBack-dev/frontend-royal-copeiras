import type { ApiListResponse, ListQueryParams } from "../../shared/contracts";
import { httpClient } from "../../shared/httpClient";
import { normalizeListResponse } from "../../shared/normalizers";
import type { Position } from "../schema";

const API_BASE_URL = "/api/positions";

export interface PositionListQueryParams extends ListQueryParams {
  search?: string;
  isActive?: boolean;
  idPositions?: string;
}

export async function getPositions(
  params: PositionListQueryParams = {},
): Promise<ApiListResponse<Position>> {
  const response = await httpClient.get<unknown>(API_BASE_URL, {
    params,
  });

  return normalizeListResponse<Position>(response.data, params.limit ?? 10);
}

// Fetches a single position by id regardless of the current list page/filter.
// The BFF/BE `getPositions` endpoint returns a one-item list when `idPositions`
// is set, so a deep link straight onto the edit form still has its record.
export async function getPositionById(id: string): Promise<Position | null> {
  const response = await getPositions({ idPositions: id });
  return response.items[0] ?? null;
}
