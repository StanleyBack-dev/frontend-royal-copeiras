import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/atoms/Button";
import Input from "../components/atoms/Input";
import CrownIcon from "../components/atoms/icons/CrownIcon";
import { colors, typography } from "../config";
import { AuthApiError } from "../api/auth/methods/http-error";
import {
  requestRecoveryCode,
  verifyRecoveryCode,
} from "../features/auth/services/password-recovery.service";
import { authRoutePaths } from "../router";
import { useToast } from "../shared/toast/useToast";
import { savePasswordRecoverySession } from "../features/auth/utils/passwordRecoveryStorage";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState<"request" | "verify">("request");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [codeError, setCodeError] = useState<string | undefined>();

  async function handleRequestCode() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailError("Informe o e-mail cadastrado");
      return;
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    if (!isValidEmail) {
      setEmailError("Informe um e-mail valido");
      return;
    }

    setEmailError(undefined);
    setRequesting(true);

    try {
      await requestRecoveryCode(normalizedEmail);
      setEmail(normalizedEmail);
      setStep("verify");
      showSuccess(
        "Codigo enviado",
        "Se o e-mail estiver cadastrado, enviamos um codigo de recuperacao.",
      );
    } catch (error) {
      const message =
        error instanceof AuthApiError || error instanceof Error
          ? error.message
          : "Nao foi possivel enviar o codigo de recuperacao.";
      showError("Falha ao solicitar codigo", message);
    } finally {
      setRequesting(false);
    }
  }

  async function handleVerifyCode() {
    const normalizedCode = code.replace(/\D/g, "").slice(0, 5);

    if (normalizedCode.length !== 5) {
      setCodeError("Informe o codigo de 5 digitos enviado por e-mail");
      return;
    }

    setCodeError(undefined);
    setVerifying(true);

    try {
      const result = await verifyRecoveryCode(email, normalizedCode);
      savePasswordRecoverySession({
        email,
        expiresAt: result.expiresAt,
        recoveryToken: result.recoveryToken,
      });
      showSuccess(
        "Codigo validado",
        "Agora voce pode cadastrar sua nova senha.",
      );
      navigate(authRoutePaths.passwordRecoveryReset, { replace: true });
    } catch (error) {
      const message =
        error instanceof AuthApiError || error instanceof Error
          ? error.message
          : "Nao foi possivel validar o codigo informado.";
      showError("Codigo invalido", message);
    } finally {
      setVerifying(false);
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
            Recuperar senha
          </h1>
          <p
            className="text-sm mt-1 text-center"
            style={{
              color: colors.brown[500],
              fontFamily: typography.fontFamily,
            }}
          >
            {step === "request"
              ? "Informe seu e-mail para receber um codigo numerico de recuperacao."
              : "Digite o codigo de 5 digitos enviado para o seu e-mail."}
          </p>
        </div>

        <div
          className="bg-white rounded-2xl shadow-md border px-8 py-8"
          style={{ borderColor: colors.brown[100] }}
        >
          {step === "request" ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleRequestCode();
              }}
              className="flex flex-col gap-5"
              noValidate
            >
              <Input
                label="E-mail"
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={emailError}
                autoComplete="email"
                autoFocus
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={requesting}
                className="w-full"
              >
                Enviar codigo
              </Button>
            </form>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleVerifyCode();
              }}
              className="flex flex-col gap-5"
              noValidate
            >
              <Input label="E-mail" type="email" value={email} disabled />

              <Input
                label="Codigo de verificacao"
                type="text"
                inputMode="numeric"
                placeholder="00000"
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 5))
                }
                error={codeError}
                autoFocus
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={verifying}
                className="w-full"
              >
                Validar codigo
              </Button>

              <button
                type="button"
                className="text-sm font-medium text-[#7a4430] hover:opacity-80 transition-opacity"
                onClick={() => {
                  setCode("");
                  setCodeError(undefined);
                  void handleRequestCode();
                }}
              >
                Reenviar codigo
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-sm font-medium text-[#7a4430] hover:opacity-80 transition-opacity"
            onClick={() => navigate(authRoutePaths.login)}
          >
            Voltar para o login
          </button>
        </div>
      </div>
    </div>
  );
}
