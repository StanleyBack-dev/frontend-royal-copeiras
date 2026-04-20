import type { ListQueryParams } from "../../shared/contracts";
import { httpClient } from "../../shared/httpClient";
import { normalizeListResponse } from "../../shared/normalizers";
import type { Contract } from "../schema";

const API_BASE_URL = "/api/contracts";

export interface ContractListQueryParams extends ListQueryParams {
  idBudgets?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export async function getContracts(
  userId: string,
  params: ContractListQueryParams = {},
) {
  const response = await httpClient.get<unknown>(API_BASE_URL, {
    params,
    headers: {
      "x-user-id": userId,
    },
  });

  return normalizeListResponse<Contract>(response.data);
}
