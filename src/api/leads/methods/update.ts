import type { Lead, UpdateLeadPayload } from "../schema";
import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";

const API_BASE_URL = "/api/leads";

export async function updateLead(
  id: string,
  payload: UpdateLeadPayload,
): Promise<Lead> {
  const response = await httpClient.put<unknown>(
    `${API_BASE_URL}/${id}`,
    payload,
  );

  return extractMutationData<Lead>(response.data);
}
