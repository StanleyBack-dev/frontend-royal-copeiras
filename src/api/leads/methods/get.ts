import type { ListQueryParams } from "../../shared/contracts";
import { httpClient } from "../../shared/httpClient";
import { normalizeListResponse } from "../../shared/normalizers";
import type { Lead } from "../schema";

const API_BASE_URL = "/api/leads";

export interface LeadListQueryParams extends ListQueryParams {
  status?: string;
  startDate?: string;
  endDate?: string;
  idLeads?: string;
}

export async function getLeads(params: LeadListQueryParams = {}) {
  const response = await httpClient.get<unknown>(API_BASE_URL, { params });

  return normalizeListResponse<Lead>(response.data);
}

// Fetches a single lead by id regardless of the current list page/filter.
// The BFF/BE `getLeads` endpoint returns a one-item list when `idLeads` is set.
export async function getLeadById(id: string): Promise<Lead | null> {
  const response = await getLeads({ idLeads: id });
  return response.items[0] ?? null;
}
