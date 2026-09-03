import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";
import type { CompanyProfile, UpdateCompanyProfilePayload } from "../schema";

const API_BASE_URL = "/api/company-profile";

export async function updateCompanyProfile(
  payload: UpdateCompanyProfilePayload,
): Promise<CompanyProfile> {
  const response = await httpClient.put<unknown>(API_BASE_URL, payload);

  return extractMutationData<CompanyProfile>(response.data);
}
