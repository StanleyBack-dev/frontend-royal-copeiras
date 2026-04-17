import { useNavigate } from "react-router-dom";
import Button from "../components/atoms/Button";
import Input from "../components/atoms/Input";
import CrownIcon from "../components/atoms/icons/CrownIcon";
import EyeIcon from "../components/atoms/icons/EyeIcon";
import EyeOffIcon from "../components/atoms/icons/EyeOffIcon";
import {
  changePasswordFirstAccess,
  useAuthSession,
  useChangePasswordForm,
} from "../features/auth";
import { colors, typography } from "../config";
import { routePaths } from "../router";
import { useToast } from "../shared/toast/useToast";
import { AuthApiError } from "../api/auth/methods/http-error";

export default function FirstAccessChangePassword() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { markPasswordChanged } = useAuthSession();

  const {
    form,
    errors,
    submitting,
    updateField,
    submit,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
  } = useChangePasswordForm({
    onSuccess: async ({ currentPassword, newPassword }) => {
      try {
        await changePasswordFirstAccess({
          currentPassword,
          newPassword,
        });

        markPasswordChanged();

        showSuccess("Senha atualizada", "Sua senha foi alterada com sucesso.");

        navigate(routePaths.dashboard, { replace: true });
      } catch (error) {
        const message =
          error instanceof AuthApiError || error instanceof Error
            ? error.message
            : "Nao foi possivel atualizar sua senha.";

        showError("Falha ao alterar senha", message);
      }
    },
  });

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
            className="text-2xl font-bold tracking-tight"
            style={{
              color: colors.brown[800],
              fontFamily: typography.fontFamily,
            }}
          >
            Alteracao obrigatoria de senha
          </h1>
          <p
            className="text-sm mt-1 text-center"
            style={{
              color: colors.brown[500],
              fontFamily: typography.fontFamily,
            }}
          >
            No primeiro acesso, voce precisa alterar sua senha temporaria.
          </p>
        </div>

        <div
          className="bg-white rounded-2xl shadow-md border px-8 py-8"
          style={{ borderColor: colors.brown[100] }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            className="flex flex-col gap-5"
            noValidate
          >
            <Input
              label="Senha atual"
              type={showCurrentPassword ? "text" : "password"}
              value={form.currentPassword}
              onChange={(e) => updateField("currentPassword", e.target.value)}
              error={errors.currentPassword}
              autoComplete="current-password"
              trailing={
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={
                    showCurrentPassword ? "Ocultar senha" : "Mostrar senha"
                  }
                  className="flex items-center justify-center text-[#7a4430] hover:opacity-70 transition-opacity focus:outline-none"
                >
                  {showCurrentPassword ? (
                    <EyeOffIcon size={18} />
                  ) : (
                    <EyeIcon size={18} />
                  )}
                </button>
              }
            />

            <Input
              label="Nova senha"
              type={showNewPassword ? "text" : "password"}
              value={form.newPassword}
              onChange={(e) => updateField("newPassword", e.target.value)}
              error={errors.newPassword}
              autoComplete="new-password"
              trailing={
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
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
              value={form.confirmNewPassword}
              onChange={(e) =>
                updateField("confirmNewPassword", e.target.value)
              }
              error={errors.confirmNewPassword}
              autoComplete="new-password"
              trailing={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
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
              Atualizar senha
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
