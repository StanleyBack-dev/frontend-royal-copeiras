import type { UpdateUserPayload, UpdateUserResponse } from "../schema";
import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";

const API_BASE_URL = "/api/users";

export async function updateUser(
  id: string,
  payload: Omit<UpdateUserPayload, "idUsers">,
): Promise<UpdateUserResponse> {
  const response = await httpClient.put<unknown>(
    `${API_BASE_URL}/${id}`,
    payload,
  );

  return extractMutationData<UpdateUserResponse>(response.data);
}
