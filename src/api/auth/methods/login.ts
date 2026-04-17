import { httpClient } from "../../shared/httpClient";
import {
  LoginPayloadSchema,
  AuthSessionResponseSchema,
  type AuthSessionResponse,
  type LoginPayload,
} from "../schema";
import { normalizeAuthHttpError } from "./http-error";

export async function login(
  payload: LoginPayload,
): Promise<AuthSessionResponse> {
  const parsedPayload = LoginPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error("Dados de login invalidos.");
  }

  try {
    const response = await httpClient.post<unknown>(
      "/api/auth/login",
      parsedPayload.data,
    );
    const parsedResponse = AuthSessionResponseSchema.safeParse(response.data);

    if (!parsedResponse.success) {
      throw new Error("Resposta de autenticacao invalida.");
    }

    return parsedResponse.data;
  } catch (error) {
    throw normalizeAuthHttpError(error, "Nao foi possivel autenticar.");
  }
}
