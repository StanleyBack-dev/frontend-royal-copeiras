import {
  ChangePasswordPayloadSchema,
  MutationBaseResponseSchema,
} from "../schema";
import { httpClient } from "../../shared/httpClient";
import { normalizeAuthHttpError } from "./http-error";

interface ChangeMyPasswordInput {
  currentPassword: string;
  newPassword: string;
}

export async function changeMyPassword(
  payload: ChangeMyPasswordInput,
): Promise<{
  success: boolean;
  message?: string | null;
  code?: string | null;
}> {
  const parsedPayload = ChangePasswordPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error("Dados de alteracao de senha invalidos.");
  }

  try {
    const response = await httpClient.post<unknown>(
      "/api/auth/change-password",
      parsedPayload.data,
    );
    const parsedResponse = MutationBaseResponseSchema.safeParse(response.data);

    if (!parsedResponse.success) {
      throw new Error("Resposta de alteracao de senha invalida.");
    }

    return parsedResponse.data;
  } catch (error) {
    throw normalizeAuthHttpError(error, "Nao foi possivel alterar a senha.");
  }
}
