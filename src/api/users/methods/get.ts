import type { User } from "../schema";
import type { ApiListResponse, ListQueryParams } from "../../shared/contracts";
import { httpClient } from "../../shared/httpClient";
import { normalizeListResponse } from "../../shared/normalizers";

const API_BASE_URL = "/api/users";

export async function getUsers(
  userId: string,
  params: ListQueryParams = {},
): Promise<ApiListResponse<User>> {
  const response = await httpClient.get<unknown>(API_BASE_URL, {
    headers: {
      "x-user-id": userId,
    },
    params,
  });

  return normalizeListResponse<User>(response.data, params.limit ?? 10);
}
