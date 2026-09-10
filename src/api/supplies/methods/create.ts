import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";
import type { CreateSupplyPayload, Supply } from "../schema";

const API_BASE_URL = "/api/supplies";

export async function createSupply(
  payload: CreateSupplyPayload,
): Promise<Supply> {
  const response = await httpClient.post<unknown>(API_BASE_URL, payload);

  return extractMutationData<Supply>(response.data);
}
