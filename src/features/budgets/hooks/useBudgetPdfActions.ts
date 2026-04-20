import { useState } from "react";
import type { CreateBudgetPayload } from "../../../api/budgets/schema";
import {
  generateBudgetPreviewPdf,
  sendBudgetEmail,
} from "../../../api/budgets/methods";
import { getHttpErrorMessage } from "../../../api/shared/http-error";
import { useToast } from "../../../shared/toast/useToast";
import { openBase64FileInNewTab } from "../../../utils/file";

interface UseBudgetPdfActionsParams {
  userId: string;
  budgetId?: string;
  budgetNumber?: string;
  onEmailSent?: () => void;
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

export function useBudgetPdfActions({
  userId,
  budgetId,
  budgetNumber,
  onEmailSent,
}: UseBudgetPdfActionsParams) {
  const [previewing, setPreviewing] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sharingWhatsApp, setSharingWhatsApp] = useState(false);
  const { showError, showSuccess } = useToast();

  async function preview(draft: CreateBudgetPayload) {
    setPreviewing(true);

    try {
      const pdf = await generateBudgetPreviewPdf(
        {
          idBudgets: budgetId,
          budgetNumber: budgetNumber || undefined,
          draft: budgetId ? undefined : draft,
        },
        userId,
      );
      const opened = openBase64FileInNewTab(pdf.base64Content, pdf.mimeType);

      if (!opened) {
        showError(
          "Falha ao abrir preview em nova aba",
          "O navegador bloqueou pop-up. Tente liberar pop-ups para este site.",
        );
      }

      showSuccess("Preview do orçamento gerado com sucesso");
      return pdf;
    } catch (error) {
      const message = getHttpErrorMessage(
        error,
        "Erro ao gerar preview do PDF",
      );
      showError("Erro ao gerar preview do PDF", message);
      return null;
    } finally {
      setPreviewing(false);
    }
  }

  async function sendEmail() {
    if (!budgetId) {
      showError(
        "Salve o orçamento antes",
        "É necessário salvar o orçamento antes de enviar por e-mail.",
      );
      return;
    }

    setSendingEmail(true);

    try {
      await sendBudgetEmail(budgetId, userId);
      showSuccess("Orçamento enviado por e-mail com sucesso");
      onEmailSent?.();
    } catch (error) {
      const message = getHttpErrorMessage(
        error,
        "Erro ao enviar o orçamento por e-mail",
      );
      showError("Erro ao enviar por e-mail", message);
    } finally {
      setSendingEmail(false);
    }
  }

  async function shareWhatsApp(
    leadName: string,
    phone: string,
  ): Promise<"shared" | "fallback" | null> {
    if (!budgetId) {
      showError(
        "Salve o orçamento antes",
        "É necessário salvar o orçamento antes de compartilhar.",
      );
      return null;
    }

    setSharingWhatsApp(true);

    try {
      const pdf = await generateBudgetPreviewPdf(
        { idBudgets: budgetId, budgetNumber: budgetNumber || undefined },
        userId,
      );

      if (!pdf) return null;

      const fileName = `orcamento-${budgetNumber || budgetId}.pdf`;
      const file = base64ToFile(pdf.base64Content, pdf.mimeType, fileName);

      const shareText =
        `Olá, ${leadName}! Tudo bem? 😊\n\n` +
        `Segue em anexo a sua proposta comercial 📎\n\n` +
        `📄 *Orçamento:* ${budgetNumber || "Não informado"}\n\n` +
        `Caso tenha qualquer dúvida ou precise de ajustes, é só me chamar! 💬\n` +
        `Será um prazer te atender.\n\n` +
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

      // Fallback: open WhatsApp with text only
      const digits = phone.replace(/\D/g, "");
      const normalized = digits.startsWith("55") ? digits : `55${digits}`;
      const fallbackText =
        `Olá, ${leadName}! Temos uma proposta comercial para você.\n` +
        `Orçamento: ${budgetNumber || ""}\n` +
        `Acesse seu e-mail para visualizar todos os detalhes da proposta. ` +
        `Qualquer dúvida, estamos à disposição!\n\nRoyal Copeiras`;
      window.open(
        `https://wa.me/${normalized}?text=${encodeURIComponent(fallbackText)}`,
        "_blank",
      );
      showSuccess(
        "PDF não pôde ser anexado neste navegador — mensagem enviada via link",
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
    shareWhatsApp,
    previewing,
    sendingEmail,
    sharingWhatsApp,
  };
}
