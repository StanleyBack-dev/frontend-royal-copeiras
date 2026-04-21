import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";
import type { SignatureRequest } from "../schema";

export async function getSignatureStatus(
  requestId: string,
  userId: string,
): Promise<SignatureRequest> {
  const response = await httpClient.get<unknown>(
    `/api/signature/${requestId}/status`,
    {
      headers: {
        "x-user-id": userId,
      },
    },
  );

  return extractMutationData<SignatureRequest>(response.data);
}
