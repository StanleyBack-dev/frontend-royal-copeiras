import { useMemo, useState } from "react";
import type { CreateBudgetPayload } from "../../../api/budgets/schema";
import {
  downloadBudgetPdf,
  freezeBudgetPdf,
  generateBudgetPreviewPdf,
} from "../../../api/budgets/methods";
import { getHttpErrorMessage } from "../../../api/shared/http-error";
import type { BudgetPdfFile } from "../../../api/budgets/pdf-schema";
import { useToast } from "../../../shared/toast/useToast";
import {
  downloadBase64File,
  openBase64FileInNewTab,
} from "../../../utils/file";

interface UseBudgetPdfActionsParams {
  userId: string;
  budgetId?: string;
  budgetNumber?: string;
  onFrozen?: (pdf: BudgetPdfFile) => void;
}

export function useBudgetPdfActions({
  userId,
  budgetId,
  budgetNumber,
  onFrozen,
}: UseBudgetPdfActionsParams) {
  const [previewing, setPreviewing] = useState(false);
  const [freezing, setFreezing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { showError, showSuccess } = useToast();

  const canFreezeOrDownload = useMemo(() => Boolean(budgetId), [budgetId]);

  async function preview(draft: CreateBudgetPayload) {
    setPreviewing(true);

    try {
      const pdf = await generateBudgetPreviewPdf(
        {
          budgetNumber: budgetNumber || undefined,
          draft,
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

  async function freeze() {
    if (!budgetId) {
      showError(
        "Salve o orçamento antes",
        "É necessário salvar o orçamento antes de gerar a versão oficial do PDF.",
      );
      return null;
    }

    setFreezing(true);

    try {
      const pdf = await freezeBudgetPdf(budgetId, userId);
      downloadBase64File(pdf.base64Content, pdf.fileName, pdf.mimeType);
      onFrozen?.(pdf);
      showSuccess("PDF oficial gerado com sucesso");
      return pdf;
    } catch (error) {
      const message = getHttpErrorMessage(error, "Erro ao gerar PDF oficial");
      showError("Erro ao gerar PDF oficial", message);
      return null;
    } finally {
      setFreezing(false);
    }
  }

  async function downloadOfficial() {
    if (!budgetId) {
      showError(
        "Salve o orçamento antes",
        "É necessário salvar o orçamento antes de baixar a versão oficial.",
      );
      return null;
    }

    setDownloading(true);

    try {
      const pdf = await downloadBudgetPdf(budgetId, userId);
      downloadBase64File(pdf.base64Content, pdf.fileName, pdf.mimeType);
      showSuccess("PDF baixado com sucesso");
      return pdf;
    } catch (error) {
      const message = getHttpErrorMessage(error, "Erro ao baixar PDF oficial");
      showError("Erro ao baixar PDF oficial", message);
      return null;
    } finally {
      setDownloading(false);
    }
  }

  return {
    preview,
    freeze,
    downloadOfficial,
    previewing,
    freezing,
    downloading,
    canFreezeOrDownload,
  };
}
