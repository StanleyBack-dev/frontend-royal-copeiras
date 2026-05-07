import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";

interface CloseContractWithoutSignatureResult {
  success: boolean;
  message: string;
  code: string;
}

export async function closeContractWithoutSignature(
  idContracts: string,
): Promise<CloseContractWithoutSignatureResult> {
  const response = await httpClient.post<unknown>(
    `/api/contracts/${idContracts}/close-without-signature`,
    {},
  );

  return extractMutationData<CloseContractWithoutSignatureResult>(
    response.data,
  );
}
