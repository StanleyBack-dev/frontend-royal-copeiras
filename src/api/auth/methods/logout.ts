import { httpClient } from "../../shared/httpClient";
import { MutationBaseResponseSchema } from "../schema";
import { normalizeAuthHttpError } from "./http-error";

export async function logout() {
  try {
    const response = await httpClient.post<unknown>("/api/auth/logout");
    const parsedResponse = MutationBaseResponseSchema.safeParse(response.data);

    if (!parsedResponse.success) {
      throw new Error("Resposta de logout invalida.");
    }

    return parsedResponse.data;
  } catch (error) {
    throw normalizeAuthHttpError(error, "Nao foi possivel encerrar a sessao.");
  }
}
