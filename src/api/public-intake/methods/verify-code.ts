import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";
import type { VerifiedPublicIntakeCode } from "../schema";

export async function verifyPublicIntakeCode(
  code: string,
): Promise<VerifiedPublicIntakeCode> {
  const response = await httpClient.post<unknown>(
    "/api/public-intake/verify-code",
    { code },
  );

  return extractMutationData<VerifiedPublicIntakeCode>(response.data);
}
