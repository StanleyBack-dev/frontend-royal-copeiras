import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";
import type { Contract, CreateContractPayload } from "../schema";

const API_BASE_URL = "/api/contracts";

export async function createContract(
  payload: CreateContractPayload,
  userId: string,
) {
  const response = await httpClient.post<unknown>(API_BASE_URL, payload, {
    headers: {
      "x-user-id": userId,
    },
  });

  return extractMutationData<Contract>(response.data);
}
