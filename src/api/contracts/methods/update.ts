import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";
import type { Contract, UpdateContractPayload } from "../schema";

const API_BASE_URL = "/api/contracts";

export async function updateContract(
  idContracts: string,
  payload: UpdateContractPayload,
  userId: string,
) {
  const response = await httpClient.patch<unknown>(
    `${API_BASE_URL}/${idContracts}`,
    payload,
    {
      headers: {
        "x-user-id": userId,
      },
    },
  );

  return extractMutationData<Contract>(response.data);
}
