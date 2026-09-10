import type { ListQueryParams } from "../../shared/contracts";
import { httpClient } from "../../shared/httpClient";
import { normalizeListResponse } from "../../shared/normalizers";
import type { Contract } from "../schema";

const API_BASE_URL = "/api/contracts";

export interface ContractListQueryParams extends ListQueryParams {
  idContracts?: string;
  idBudgets?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export async function getContracts(params: ContractListQueryParams = {}) {
  const response = await httpClient.get<unknown>(API_BASE_URL, { params });

  return normalizeListResponse<Contract>(response.data);
}

// Fetches a single contract by id regardless of the current list page/filter.
// The BFF/BE `getContracts` endpoint returns a one-item list when `idContracts`
// is set, so a deep link straight onto the edit form still has its record.
export async function getContractById(id: string): Promise<Contract | null> {
  const response = await getContracts({ idContracts: id });
  return response.items[0] ?? null;
}
