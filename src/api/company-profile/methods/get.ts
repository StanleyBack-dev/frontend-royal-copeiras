import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";
import type { CompanyProfile } from "../schema";

const API_BASE_URL = "/api/company-profile";

export async function getCompanyProfile(): Promise<CompanyProfile> {
  const response = await httpClient.get<unknown>(API_BASE_URL);

  return extractMutationData<CompanyProfile>(response.data);
}
