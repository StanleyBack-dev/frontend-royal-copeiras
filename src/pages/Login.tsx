import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithPassword, useLoginForm } from "../features/auth";
import Input from "../components/atoms/Input";
import Button from "../components/atoms/Button";
import Toggle from "../components/atoms/Toggle";
import CrownIcon from "../components/atoms/icons/CrownIcon";
import EyeIcon from "../components/atoms/icons/EyeIcon";
import EyeOffIcon from "../components/atoms/icons/EyeOffIcon";
import { colors, typography } from "../config";
import { useToast } from "../shared/toast/useToast";
import { authRoutePaths, routePaths } from "../router";
import { useAuthSession } from "../features/auth";
import { AuthApiError } from "../api/auth/methods/http-error";

export default function Login() {
  const navigate = useNavigate();
  const { showError, showSuccess, showToast } = useToast();
  const {
    setSession,
    isAuthenticated,
    requiresPasswordChange,
    isInitializing,
  } = useAuthSession();

  useEffect(() => {
    if (isInitializing || !isAuthenticated) return;

    navigate(
      requiresPasswordChange
        ? authRoutePaths.firstAccessChangePassword
        : routePaths.dashboard,
      { replace: true },
    );
  }, [isAuthenticated, isInitializing, navigate, requiresPasswordChange]);

  const {
    form,
    updateField,
    errors,
    showPassword,
    toggleShowPassword,
    submit,
    submitting,
  } = useLoginForm({
    onSuccess: async ({ identifier, password }) => {
      try {
        const session = await loginWithPassword({
          username: identifier,
          password,
        });

        if (!session.authenticated) {
          showError(
            "Falha no login",
            "Nao foi possivel autenticar com estas credenciais.",
          );
          return;
        }

        setSession(session);
        showSuccess("Login realizado", `Bem-vindo, ${session.user.name}.`);

        if (session.mustChangePassword) {
          showToast({
            variant: "info",
            title: "Alteracao de senha pendente",
            description:
              "Seu usuario requer troca de senha no primeiro acesso.",
          });

          navigate(authRoutePaths.firstAccessChangePassword, {
            replace: true,
          });
          return;
        }

        navigate(routePaths.dashboard, { replace: true });
      } catch (error) {
        const message =
          error instanceof AuthApiError || error instanceof Error
            ? error.message
            : "Nao foi possivel realizar o login. Tente novamente.";

        showError("Erro ao entrar", message);
      }
    },
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "#faf6f2" }}
    >
      <div className="w-full max-w-md">
        {/* Logotipo */}
        <div className="flex flex-col items-center mb-8 select-none">
          <div
            className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-md"
            style={{
              background: "linear-gradient(135deg, #C9A227, #a8811a)",
            }}
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
            Royal Copeiras
          </h1>
          <p
            className="text-sm mt-1"
            style={{
              color: colors.brown[500],
              fontFamily: typography.fontFamily,
            }}
          >
            Acesse sua conta para continuar
          </p>
        </div>

        {/* Card */}
        <div
          className="bg-white rounded-2xl shadow-md border px-8 py-8"
          style={{ borderColor: colors.brown[100] }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            noValidate
            className="flex flex-col gap-5"
          >
            {/* Usuário */}
            <Input
              label="Usuário"
              type="text"
              placeholder="Digite seu usuário"
              value={form.identifier}
              onChange={(e) => updateField("identifier", e.target.value)}
              error={errors.identifier}
              autoComplete="username"
              autoFocus
            />

            {/* Senha */}
            <Input
              label="Senha"
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              error={errors.password}
              autoComplete="current-password"
              trailing={
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="flex items-center justify-center text-[#7a4430] hover:opacity-70 transition-opacity focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOffIcon size={18} />
                  ) : (
                    <EyeIcon size={18} />
                  )}
                </button>
              }
            />

            {/* Lembrar usuário */}
            <div className="flex items-center gap-3">
              <Toggle
                checked={form.rememberMe}
                onChange={(v) => updateField("rememberMe", v)}
                aria-label="Lembrar meu usuário"
              />
              <span
                className="text-sm cursor-pointer select-none"
                style={{
                  color: colors.brown[500],
                  fontFamily: typography.fontFamily,
                }}
                onClick={() => updateField("rememberMe", !form.rememberMe)}
              >
                Lembrar meu usuário
              </span>
            </div>

            {/* Botão de entrar */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              className="w-full mt-1"
            >
              Entrar
            </Button>
          </form>
        </div>

        {/* Rodapé */}
        <p
          className="text-center text-xs mt-6"
          style={{
            color: colors.brown[300],
            fontFamily: typography.fontFamily,
          }}
        >
          &copy; {new Date().getFullYear()} Royal Copeiras. Todos os direitos
          reservados.
        </p>
      </div>
    </div>
  );
}
