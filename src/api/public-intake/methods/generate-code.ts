import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";
import type { GeneratedPublicIntakeCode } from "../schema";

export async function generatePublicIntakeCode(): Promise<GeneratedPublicIntakeCode> {
  const response = await httpClient.post<unknown>(
    "/api/public-intake/generate-code",
    {},
  );

  return extractMutationData<GeneratedPublicIntakeCode>(response.data);
}
