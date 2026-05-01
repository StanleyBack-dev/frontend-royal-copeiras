import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";
import type {
  ContractPdfFile,
  GenerateContractPreviewPayload,
} from "../pdf-schema";

export async function generateContractPreviewPdf(
  payload: GenerateContractPreviewPayload,
): Promise<ContractPdfFile> {
  const response = await httpClient.post<unknown>(
    "/api/contracts/pdf/preview",
    payload,
  );

  return extractMutationData<ContractPdfFile>(response.data);
}
