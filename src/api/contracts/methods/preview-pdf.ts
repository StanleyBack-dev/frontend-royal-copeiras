import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";
import type {
  ContractPdfFile,
  GenerateContractPreviewPayload,
} from "../pdf-schema";

export async function generateContractPreviewPdf(
  payload: GenerateContractPreviewPayload,
  userId: string,
): Promise<ContractPdfFile> {
  const response = await httpClient.post<unknown>(
    "/api/contracts/pdf/preview",
    payload,
    {
      headers: {
        "x-user-id": userId,
      },
    },
  );

  return extractMutationData<ContractPdfFile>(response.data);
}
