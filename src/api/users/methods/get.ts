import type { User } from "../schema";
import type { ApiListResponse, ListQueryParams } from "../../shared/contracts";
import { httpClient } from "../../shared/httpClient";
import { normalizeListResponse } from "../../shared/normalizers";

const API_BASE_URL = "/api/users";

export interface UserListQueryParams extends ListQueryParams {
  idUsers?: string;
}

export async function getUsers(
  params: UserListQueryParams = {},
): Promise<ApiListResponse<User>> {
  const response = await httpClient.get<unknown>(API_BASE_URL, {
    params,
  });

  return normalizeListResponse<User>(response.data, params.limit ?? 10);
}

// Fetches a single user by id regardless of the current list page/filter.
// The BFF/BE `getUsers` endpoint returns a one-item list when `idUsers` is set,
// so a deep link straight onto the edit form still has its record.
export async function getUserById(id: string): Promise<User | null> {
  const response = await getUsers({ idUsers: id });
  return response.items[0] ?? null;
}
