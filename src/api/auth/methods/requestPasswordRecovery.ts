import {
  MutationBaseResponseSchema,
  RequestPasswordRecoveryPayloadSchema,
  type RequestPasswordRecoveryPayload,
} from "../schema";
import { httpClient } from "../../shared/httpClient";
import { normalizeAuthHttpError } from "./http-error";

export async function requestPasswordRecovery(
  payload: RequestPasswordRecoveryPayload,
): Promise<{
  success: boolean;
  message?: string | null;
  code?: string | null;
}> {
  const parsedPayload = RequestPasswordRecoveryPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error("Dados de recuperacao de senha invalidos.");
  }

  try {
    const response = await httpClient.post<unknown>(
      "/api/auth/password-recovery/request",
      parsedPayload.data,
    );
    const parsedResponse = MutationBaseResponseSchema.safeParse(response.data);

    if (!parsedResponse.success) {
      throw new Error("Resposta de recuperacao de senha invalida.");
    }

    return parsedResponse.data;
  } catch (error) {
    throw normalizeAuthHttpError(
      error,
      "Nao foi possivel solicitar a recuperacao de senha.",
    );
  }
}
