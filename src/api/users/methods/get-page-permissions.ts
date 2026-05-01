import type { UserPagePermissionsResponse } from "../schema";
import { httpClient } from "../../shared/httpClient";

const API_BASE_URL = "/api/users";

export async function getUserPagePermissions(
  idUsers: string,
): Promise<UserPagePermissionsResponse> {
  const response = await httpClient.get<UserPagePermissionsResponse>(
    `${API_BASE_URL}/${idUsers}/page-permissions`,
  );

  return response.data;
}
