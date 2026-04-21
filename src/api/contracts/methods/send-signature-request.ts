import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";

interface SendContractSignatureRequestResult {
  success: boolean;
  message: string;
  code: string;
}

export async function sendContractSignatureRequest(
  idContracts: string,
  userId: string,
): Promise<SendContractSignatureRequestResult> {
  const response = await httpClient.post<unknown>(
    `/api/contracts/${idContracts}/signature-request`,
    {},
    {
      headers: {
        "x-user-id": userId,
      },
    },
  );

  return extractMutationData<SendContractSignatureRequestResult>(response.data);
}
