import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";

interface SendContractSignatureRequestResult {
  success: boolean;
  message: string;
  code: string;
}

export async function sendContractSignatureRequest(
  idContracts: string,
): Promise<SendContractSignatureRequestResult> {
  const response = await httpClient.post<unknown>(
    `/api/contracts/${idContracts}/signature-request`,
    {},
    // Creating the envelope with the external signature provider can take
    // longer than the default 10s timeout; a slow-but-successful call should
    // not surface as a client-side error. Kept generous since a real timeout
    // here should still fail eventually rather than hang indefinitely.
    { timeout: 45000 },
  );

  return extractMutationData<SendContractSignatureRequestResult>(response.data);
}
