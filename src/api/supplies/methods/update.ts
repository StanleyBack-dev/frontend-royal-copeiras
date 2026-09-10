import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";
import type { Supply, UpdateSupplyPayload } from "../schema";

const API_BASE_URL = "/api/supplies";

export async function updateSupply(
  id: string,
  payload: UpdateSupplyPayload,
): Promise<Supply> {
  const response = await httpClient.put<unknown>(
    `${API_BASE_URL}/${id}`,
    payload,
  );

  return extractMutationData<Supply>(response.data);
}
