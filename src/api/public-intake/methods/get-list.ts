import { httpClient } from "../../shared/httpClient";
import { normalizeListResponse } from "../../shared/normalizers";
import type { PublicIntakeCodeListItem } from "../schema";

export interface PublicIntakeCodeListQueryParams {
  page?: number;
  limit?: number;
}

export async function getPublicIntakeCodes(
  params: PublicIntakeCodeListQueryParams = {},
) {
  const response = await httpClient.get<unknown>("/api/public-intake", {
    params,
  });

  return normalizeListResponse<PublicIntakeCodeListItem>(response.data);
}
