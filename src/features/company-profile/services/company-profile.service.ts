import {
  getCompanyProfile,
  updateCompanyProfile,
} from "@/api/company-profile/methods";
import {
  CompanyProfileSchema,
  UpdateCompanyProfilePayloadSchema,
  type CompanyProfile,
  type UpdateCompanyProfilePayload,
} from "@/api/company-profile/schema";

const INVALID_DATA_MESSAGE = "Dados do perfil da empresa inválidos.";

export async function fetchCompanyProfile(): Promise<CompanyProfile> {
  const response = await getCompanyProfile();
  const parsed = CompanyProfileSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error(INVALID_DATA_MESSAGE);
  }

  return parsed.data;
}

export async function saveCompanyProfile(
  payload: UpdateCompanyProfilePayload,
): Promise<CompanyProfile> {
  const parsedPayload = UpdateCompanyProfilePayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error(INVALID_DATA_MESSAGE);
  }

  const response = await updateCompanyProfile(parsedPayload.data);
  const parsedResponse = CompanyProfileSchema.safeParse(response);

  if (!parsedResponse.success) {
    throw new Error(INVALID_DATA_MESSAGE);
  }

  return parsedResponse.data;
}
