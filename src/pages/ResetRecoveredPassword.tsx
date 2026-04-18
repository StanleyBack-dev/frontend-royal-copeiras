import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/atoms/Button";
import Input from "../components/atoms/Input";
import CrownIcon from "../components/atoms/icons/CrownIcon";
import EyeIcon from "../components/atoms/icons/EyeIcon";
import EyeOffIcon from "../components/atoms/icons/EyeOffIcon";
import { colors, typography } from "../config";
import { AuthApiError } from "../api/auth/methods/http-error";
import { completePasswordRecovery } from "../features/auth/services/password-recovery.service";
import {
  clearPasswordRecoverySession,
  getPasswordRecoverySession,
} from "../features/auth/utils/passwordRecoveryStorage";
import { authRoutePaths } from "../router";
import { useToast } from "../shared/toast/useToast";

export default function ResetRecoveredPassword() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [recoverySession, setRecoverySession] = useState(
    getPasswordRecoverySession(),
  );

  useEffect(() => {
    if (recoverySession) {
      return;
    }

    navigate(authRoutePaths.passwordRecovery, { replace: true });
  }, [navigate, recoverySession]);

  if (!recoverySession) {
    return null;
  }

  async function handleSubmit() {
    const currentRecoverySession = recoverySession;

    if (!currentRecoverySession) {
      navigate(authRoutePaths.passwordRecovery, { replace: true });
      return;
    }

    const nextErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (newPassword.length < 8) {
      nextErrors.newPassword = "A nova senha deve ter pelo menos 8 caracteres";
    }

    if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = "As senhas nao conferem";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await completePasswordRecovery(
        currentRecoverySession.recoveryToken,
        newPassword,
      );
      clearPasswordRecoverySession();
      showSuccess(
        "Senha redefinida",
        "Sua senha foi atualizada. Faça login com a nova senha.",
      );
      navigate(authRoutePaths.login, { replace: true });
    } catch (error) {
      const message =
        error instanceof AuthApiError || error instanceof Error
          ? error.message
          : "Nao foi possivel redefinir a senha.";

      if (
        error instanceof AuthApiError &&
        error.code === "AUTH_PASSWORD_RECOVERY_NOT_ALLOWED"
      ) {
        clearPasswordRecoverySession();
        setRecoverySession(null);
      }

      showError("Falha ao redefinir senha", message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "#faf6f2" }}
    >
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 select-none">
          <div
            className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-md"
            style={{ background: "linear-gradient(135deg, #C9A227, #a8811a)" }}
          >
            <CrownIcon size={32} color="white" />
          </div>
          <h1
            className="text-2xl font-bold tracking-tight text-center"
            style={{
              color: colors.brown[800],
              fontFamily: typography.fontFamily,
            }}
          >
            Definir nova senha
          </h1>
          <p
            className="text-sm mt-1 text-center"
            style={{
              color: colors.brown[500],
              fontFamily: typography.fontFamily,
            }}
          >
            Escolha uma nova senha para a conta {recoverySession.email}.
          </p>
        </div>

        <div
          className="bg-white rounded-2xl shadow-md border px-8 py-8"
          style={{ borderColor: colors.brown[100] }}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
            className="flex flex-col gap-5"
            noValidate
          >
            <Input
              label="Nova senha"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              error={errors.newPassword}
              autoComplete="new-password"
              autoFocus
              trailing={
                <button
                  type="button"
                  onClick={() => setShowNewPassword((value) => !value)}
                  tabIndex={-1}
                  aria-label={
                    showNewPassword ? "Ocultar senha" : "Mostrar senha"
                  }
                  className="flex items-center justify-center text-[#7a4430] hover:opacity-70 transition-opacity focus:outline-none"
                >
                  {showNewPassword ? (
                    <EyeOffIcon size={18} />
                  ) : (
                    <EyeIcon size={18} />
                  )}
                </button>
              }
            />

            <Input
              label="Confirmar nova senha"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              error={errors.confirmPassword}
              autoComplete="new-password"
              trailing={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  tabIndex={-1}
                  aria-label={
                    showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                  }
                  className="flex items-center justify-center text-[#7a4430] hover:opacity-70 transition-opacity focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon size={18} />
                  ) : (
                    <EyeIcon size={18} />
                  )}
                </button>
              }
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              className="w-full"
            >
              Salvar nova senha
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
