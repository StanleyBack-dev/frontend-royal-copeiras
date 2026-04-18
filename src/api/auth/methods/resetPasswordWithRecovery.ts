import {
  MutationBaseResponseSchema,
  ResetPasswordWithRecoveryPayloadSchema,
  type ResetPasswordWithRecoveryPayload,
} from "../schema";
import { httpClient } from "../../shared/httpClient";
import { normalizeAuthHttpError } from "./http-error";

export async function resetPasswordWithRecovery(
  payload: ResetPasswordWithRecoveryPayload,
): Promise<{
  success: boolean;
  message?: string | null;
  code?: string | null;
}> {
  const parsedPayload =
    ResetPasswordWithRecoveryPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error("Dados de redefinicao de senha invalidos.");
  }

  try {
    const response = await httpClient.post<unknown>(
      "/api/auth/password-recovery/reset",
      parsedPayload.data,
    );
    const parsedResponse = MutationBaseResponseSchema.safeParse(response.data);

    if (!parsedResponse.success) {
      throw new Error("Resposta de redefinicao de senha invalida.");
    }

    return parsedResponse.data;
  } catch (error) {
    throw normalizeAuthHttpError(error, "Nao foi possivel redefinir a senha.");
  }
}
