import { useState } from "react";
import {
  generateContractPreviewPdf,
  sendContractEmail,
  sendContractSignatureRequest,
} from "../../../api/contracts/methods";
import { getHttpErrorMessage } from "../../../api/shared/http-error";
import { useToast } from "../../../shared/toast/useToast";
import { openBase64FileInNewTab } from "../../../utils/file";
import { contractUiCopy } from "../model/messages";

interface UseContractPdfActionsParams {
  userId: string;
  contractId?: string;
  contractNumber?: string;
  onEmailSent?: () => void;
  onSignatureRequested?: () => void;
}

function base64ToFile(
  base64: string,
  mimeType: string,
  fileName: string,
): File {
  const byteChars = atob(base64);
  const byteNumbers = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  return new File([byteNumbers], fileName, { type: mimeType });
}

export function useContractPdfActions({
  userId,
  contractId,
  contractNumber,
  onEmailSent,
  onSignatureRequested,
}: UseContractPdfActionsParams) {
  const [previewing, setPreviewing] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingSignatureRequest, setSendingSignatureRequest] = useState(false);
  const [sharingWhatsApp, setSharingWhatsApp] = useState(false);
  const { showError, showSuccess } = useToast();

  async function preview() {
    if (!contractId) {
      showError(
        "Salve o contrato antes",
        "E necessario salvar antes de gerar preview.",
      );
      return null;
    }

    setPreviewing(true);

    try {
      const pdf = await generateContractPreviewPdf(
        { idContracts: contractId },
        userId,
      );
      const opened = openBase64FileInNewTab(pdf.base64Content, pdf.mimeType);

      if (!opened) {
        showError(
          "Falha ao abrir preview em nova aba",
          "O navegador bloqueou pop-up. Tente liberar pop-ups para este site.",
        );
      }

      showSuccess(contractUiCopy.success.previewContract);
      return pdf;
    } catch (error) {
      const message = getHttpErrorMessage(
        error,
        contractUiCopy.errors.previewContractFallback,
      );
      showError(contractUiCopy.errors.previewContractFallback, message);
      return null;
    } finally {
      setPreviewing(false);
    }
  }

  async function sendEmail() {
    if (!contractId) {
      showError(
        "Salve o contrato antes",
        "E necessario salvar o contrato antes de enviar por e-mail.",
      );
      return;
    }

    setSendingEmail(true);

    try {
      await sendContractEmail(contractId, userId);
      showSuccess("Prévia do contrato enviada por e-mail com sucesso");
      onEmailSent?.();
    } catch (error) {
      const message = getHttpErrorMessage(
        error,
        "Erro ao enviar o contrato por e-mail",
      );
      showError("Erro ao enviar por e-mail", message);
    } finally {
      setSendingEmail(false);
    }
  }

  async function sendSignatureRequest() {
    if (!contractId) {
      showError(
        "Salve o contrato antes",
        "E necessario salvar o contrato antes de enviar para assinatura.",
      );
      return;
    }

    setSendingSignatureRequest(true);
    try {
      await sendContractSignatureRequest(contractId, userId);
      showSuccess("Contrato enviado para assinatura com sucesso");
      onSignatureRequested?.();
    } catch (error) {
      const message = getHttpErrorMessage(
        error,
        "Erro ao enviar o contrato para assinatura",
      );
      showError("Erro ao enviar para assinatura", message);
    } finally {
      setSendingSignatureRequest(false);
    }
  }

  async function shareWhatsApp(
    leadName: string,
    phone: string,
  ): Promise<"shared" | "fallback" | null> {
    if (!contractId) {
      showError(
        "Salve o contrato antes",
        "E necessario salvar o contrato antes de compartilhar.",
      );
      return null;
    }

    setSharingWhatsApp(true);

    try {
      const pdf = await generateContractPreviewPdf(
        { idContracts: contractId },
        userId,
      );

      if (!pdf) return null;

      const fileName = `contrato-${contractNumber || contractId}.pdf`;
      const file = base64ToFile(pdf.base64Content, pdf.mimeType, fileName);

      const shareText =
        `Olá, ${leadName}! Tudo bem? 😊\n\n` +
        `Estou enviando em anexo o contrato para sua análise 📎\n\n` +
        `📄 *Contrato:* ${contractNumber}\n\n` +
        `Se tiver qualquer dúvida, fico à disposição! 💬\n\n` +
        `Atenciosamente,\n` +
        `Royal Copeiras`;

      const canShare =
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });

      if (canShare) {
        await navigator.share({ files: [file], text: shareText });
        showSuccess("PDF compartilhado com sucesso");
        return "shared";
      }

      const digits = phone.replace(/\D/g, "");
      const normalized = digits.startsWith("55") ? digits : `55${digits}`;
      const fallbackText =
        `Ola, ${leadName}! Temos um contrato para voce.\n` +
        `Contrato: ${contractNumber || ""}\n` +
        `Acesse seu e-mail para visualizar o documento completo.`;
      window.open(
        `https://wa.me/${normalized}?text=${encodeURIComponent(fallbackText)}`,
        "_blank",
      );
      showSuccess(
        "PDF nao pode ser anexado neste navegador. Mensagem enviada via link.",
      );
      return "fallback";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return null;
      }
      const message = getHttpErrorMessage(error, "Erro ao compartilhar o PDF");
      showError("Erro ao compartilhar", message);
      return null;
    } finally {
      setSharingWhatsApp(false);
    }
  }

  return {
    preview,
    sendEmail,
    sendSignatureRequest,
    shareWhatsApp,
    previewing,
    sendingEmail,
    sendingSignatureRequest,
    sharingWhatsApp,
  };
}
