import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";

interface SendContractEmailResult {
  success: boolean;
  message: string;
  code: string;
}

export async function sendContractEmail(
  idContracts: string,
): Promise<SendContractEmailResult> {
  const response = await httpClient.post<unknown>(
    `/api/contracts/${idContracts}/pdf/send-email`,
    {},
  );

  return extractMutationData<SendContractEmailResult>(response.data);
}
