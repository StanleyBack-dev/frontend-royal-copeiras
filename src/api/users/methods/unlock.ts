import type { UnlockUserResponse } from "../schema";
import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";

const API_BASE_URL = "/api/users";

export async function unlockUser(id: string): Promise<UnlockUserResponse> {
  const response = await httpClient.post<unknown>(
    `${API_BASE_URL}/${id}/unlock`,
    {},
  );

  return extractMutationData<UnlockUserResponse>(response.data);
}
