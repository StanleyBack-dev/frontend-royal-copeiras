import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";

interface SendContractEmailResult {
  success: boolean;
  message: string;
  code: string;
}

export async function sendContractEmail(
  idContracts: string,
  userId: string,
): Promise<SendContractEmailResult> {
  const response = await httpClient.post<unknown>(
    `/api/contracts/${idContracts}/pdf/send-email`,
    {},
    {
      headers: {
        "x-user-id": userId,
      },
    },
  );

  return extractMutationData<SendContractEmailResult>(response.data);
}
