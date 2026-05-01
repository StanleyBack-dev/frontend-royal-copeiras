import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";
import type {
  CreateSignatureRequestPayload,
  SignatureRequest,
} from "../schema";

export async function createSignatureRequest(
  payload: CreateSignatureRequestPayload,
): Promise<SignatureRequest> {
  const response = await httpClient.post<unknown>("/api/signature", payload);

  return extractMutationData<SignatureRequest>(response.data);
}
