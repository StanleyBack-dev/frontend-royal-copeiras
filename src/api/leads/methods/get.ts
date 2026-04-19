import type { ListQueryParams } from "../../shared/contracts";
import { httpClient } from "../../shared/httpClient";
import { normalizeListResponse } from "../../shared/normalizers";
import type { Lead } from "../schema";

const API_BASE_URL = "/api/leads";

export interface LeadListQueryParams extends ListQueryParams {
  status?: string;
  startDate?: string;
  endDate?: string;
}

export async function getLeads(
  userId: string,
  params: LeadListQueryParams = {},
) {
  const response = await httpClient.get<unknown>(API_BASE_URL, {
    params,
    headers: {
      "x-user-id": userId,
    },
  });

  return normalizeListResponse<Lead>(response.data);
}
