import type { CreateLeadPayload, Lead } from "../schema";
import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";

const API_BASE_URL = "/api/leads";

export async function createLead(
  payload: CreateLeadPayload,
  userId: string,
): Promise<Lead> {
  const response = await httpClient.post<unknown>(API_BASE_URL, payload, {
    headers: {
      "x-user-id": userId,
    },
  });

  return extractMutationData<Lead>(response.data);
}
