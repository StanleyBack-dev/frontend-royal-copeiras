import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";
import type { SignatureRequest } from "../schema";

export async function getSignatureStatus(
  requestId: string,
): Promise<SignatureRequest> {
  const response = await httpClient.get<unknown>(
    `/api/signature/${requestId}/status`,
  );

  return extractMutationData<SignatureRequest>(response.data);
}
