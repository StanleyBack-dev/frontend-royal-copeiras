import { httpClient } from "../../shared/httpClient";
import { AuthSessionResponseSchema, type AuthSessionResponse } from "../schema";
import { normalizeAuthHttpError } from "./http-error";

export async function refreshAuthSession(): Promise<AuthSessionResponse> {
  try {
    const response = await httpClient.post<unknown>("/api/auth/refresh");
    const parsedResponse = AuthSessionResponseSchema.safeParse(response.data);

    if (!parsedResponse.success) {
      throw new Error("Resposta de refresh de sessao invalida.");
    }

    return parsedResponse.data;
  } catch (error) {
    throw normalizeAuthHttpError(error, "Nao foi possivel renovar a sessao.");
  }
}
