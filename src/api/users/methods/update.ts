import type { UpdateUserPayload, UpdateUserResponse } from "../schema";
import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";

const API_BASE_URL = "/api/users";

export async function updateUser(
  id: string,
  payload: Omit<UpdateUserPayload, "idUsers">,
  userId: string,
): Promise<UpdateUserResponse> {
  const response = await httpClient.put<unknown>(
    `${API_BASE_URL}/${id}`,
    payload,
    {
      headers: {
        "x-user-id": userId,
      },
    },
  );

  return extractMutationData<UpdateUserResponse>(response.data);
}
