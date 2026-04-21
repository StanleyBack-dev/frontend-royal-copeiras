import { httpClient } from "../../shared/httpClient";
import { normalizeListResponse } from "../../shared/normalizers";
import type { SignatureListItem } from "../schema";

export interface SignatureListQueryParams {
  page?: number;
  limit?: number;
  idContracts?: string;
  status?: string;
}

export async function getSignatures(
  userId: string,
  params: SignatureListQueryParams = {},
) {
  const response = await httpClient.get<unknown>("/api/signature", {
    params,
    headers: {
      "x-user-id": userId,
    },
  });

  return normalizeListResponse<SignatureListItem>(response.data);
}
