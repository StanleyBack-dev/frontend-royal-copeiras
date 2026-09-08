import { useState } from "react";
import { MessageCircle, Copy, X } from "lucide-react";
import type { GeneratedPublicIntakeCode } from "@/api/public-intake/schema";
import { publicFormRoutePaths } from "@/router";
import { formatDateTimeDisplay } from "@/utils/format";
import { publicIntakeUiCopy } from "../model/messages";

interface GeneratedCodeDialogProps {
  issued: GeneratedPublicIntakeCode;
  leadName?: string;
  leadPhone?: string;
  onClose: () => void;
}

function buildFormUrl(): string {
  return `${window.location.origin}${publicFormRoutePaths.requestBudget}`;
}

function buildShareMessage(
  issued: GeneratedPublicIntakeCode,
  leadName?: string,
): string {
  const greeting = leadName ? `Olá, ${leadName}! Tudo bem? 😊` : "Olá! Tudo bem? 😊";

  return (
    `${greeting}\n\n` +
    `Preparamos um formulário rápido pra você nos contar os detalhes do seu evento e já começarmos seu orçamento 📝\n\n` +
    `🔗 *Link:* ${buildFormUrl()}\n` +
    `🔑 *Código de acesso:* ${issued.code}\n\n` +
    `Esse código é de uso único e válido até ${formatDateTimeDisplay(issued.expiresAt)}.\n\n` +
    `Qualquer dúvida, estou à disposição!\n\n` +
    `Royal Copeiras`
  );
}

export default function GeneratedCodeDialog({
  issued,
  leadName,
  leadPhone,
  onClose,
}: GeneratedCodeDialogProps) {
  const [copied, setCopied] = useState(false);
  const formUrl = buildFormUrl();
  const shareMessage = buildShareMessage(issued, leadName);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable; the message is still visible to copy by hand
    }
  }

  function handleShareWhatsApp() {
    const digits = (leadPhone || "").replace(/\D/g, "");
    const normalized = digits
      ? digits.startsWith("55")
        ? digits
        : `55${digits}`
      : "";

    // With no known phone (generated outside a lead's context), omit the
    // number so WhatsApp lets the operator pick who to send it to.
    const target = normalized
      ? `https://wa.me/${normalized}`
      : "https://wa.me/";

    window.open(
      `${target}?text=${encodeURIComponent(shareMessage)}`,
      "_blank",
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-[#e8d5c4]">
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div>
            <h2 className="text-base font-bold text-[#2C1810]">
              {publicIntakeUiCopy.generateDialog.title}
            </h2>
            <p className="mt-1 text-sm text-[#5a3e35]">
              {publicIntakeUiCopy.generateDialog.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-[#9a7060] hover:text-[#5a3e35]"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 px-6 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
              {publicIntakeUiCopy.generateDialog.linkLabel}
            </p>
            <p className="mt-1 break-all rounded-lg border border-[#e8d5c9] bg-[#faf6f2] px-3 py-2 text-sm text-[#2c1810]">
              {formUrl}
            </p>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
                {publicIntakeUiCopy.generateDialog.codeLabel}
              </p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-widest text-[#2c1810]">
                {issued.code}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
                {publicIntakeUiCopy.generateDialog.expiresAtLabel}
              </p>
              <p className="mt-1 text-sm text-[#2c1810]">
                {formatDateTimeDisplay(issued.expiresAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-6 pb-6 sm:flex-row">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe5a]"
          >
            <MessageCircle size={16} />
            {publicIntakeUiCopy.generateDialog.shareWhatsApp}
          </button>
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#e8d5c9] px-4 py-2 text-sm font-semibold text-[#7a4430] transition-colors hover:bg-[#faf6f2]"
          >
            <Copy size={16} />
            {copied
              ? publicIntakeUiCopy.success.copied
              : publicIntakeUiCopy.generateDialog.copyMessage}
          </button>
        </div>
      </div>
    </div>
  );
}
