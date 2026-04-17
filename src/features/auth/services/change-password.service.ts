import { changeMyPassword } from "../../../api/auth/methods/changeMyPassword";

interface ChangePasswordFirstAccessInput {
  currentPassword: string;
  newPassword: string;
}

export async function changePasswordFirstAccess(
  payload: ChangePasswordFirstAccessInput,
) {
  const response = await changeMyPassword(payload);

  if (!response.success) {
    throw new Error(response.message || "Nao foi possivel alterar sua senha.");
  }

  return response;
}
