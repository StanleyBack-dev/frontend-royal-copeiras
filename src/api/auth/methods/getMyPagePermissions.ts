import { httpClient } from "../../shared/httpClient";
import {
  UserPagePermissionsResponseSchema,
  type UserPagePermissionsResponse,
} from "../../users/schema";
import { normalizeAuthHttpError } from "./http-error";

export async function getMyPagePermissions(
  userId: string,
): Promise<UserPagePermissionsResponse> {
  try {
    const response = await httpClient.get<unknown>(
      "/api/users/me/page-permissions",
      {
        headers: {
          "x-user-id": userId,
        },
      },
    );
    const parsed = UserPagePermissionsResponseSchema.safeParse(response.data);

    if (!parsed.success) {
      throw new Error("Resposta de permissões de páginas inválida.");
    }

    return parsed.data;
  } catch (error) {
    throw normalizeAuthHttpError(
      error,
      "Nao foi possivel carregar as permissões de páginas.",
    );
  }
}
