import {
  VerifyPasswordRecoveryCodePayloadSchema,
  VerifyPasswordRecoveryCodeResponseSchema,
  type VerifyPasswordRecoveryCodePayload,
  type VerifyPasswordRecoveryCodeResponse,
} from "../schema";
import { httpClient } from "../../shared/httpClient";
import { normalizeAuthHttpError } from "./http-error";

export async function verifyPasswordRecoveryCode(
  payload: VerifyPasswordRecoveryCodePayload,
): Promise<VerifyPasswordRecoveryCodeResponse> {
  const parsedPayload =
    VerifyPasswordRecoveryCodePayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error("Dados do codigo de recuperacao invalidos.");
  }

  try {
    const response = await httpClient.post<unknown>(
      "/api/auth/password-recovery/verify",
      parsedPayload.data,
    );
    const parsedResponse = VerifyPasswordRecoveryCodeResponseSchema.safeParse(
      response.data,
    );

    if (!parsedResponse.success) {
      throw new Error("Resposta de validacao do codigo invalida.");
    }

    return parsedResponse.data;
  } catch (error) {
    throw normalizeAuthHttpError(
      error,
      "Nao foi possivel validar o codigo de recuperacao.",
    );
  }
}
