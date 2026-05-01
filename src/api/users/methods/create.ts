import type { CreateUserPayload, CreateUserResponse } from "../schema";
import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";

const API_BASE_URL = "/api/users";

export async function createUser(
  payload: CreateUserPayload,
): Promise<CreateUserResponse> {
  const response = await httpClient.post<unknown>(API_BASE_URL, payload);

  return extractMutationData<CreateUserResponse>(response.data);
}
