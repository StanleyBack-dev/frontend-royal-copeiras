import type { DataTableColumn } from "../../../components/organisms/DataTable";
import type { Contract } from "../../../api/contracts/schema";
import { formatDateTimeDisplay } from "../../../utils/format";
import { signatureUiCopy } from "./messages";
import CopyIcon from "../../../components/atoms/icons/CopyIcon";

export interface SignatureItem {
  idContracts: string;
  contractNumber: string;
  contractStatus: Contract["status"];
  updatedAt: string;
  signatureStatus?: string;
  signatureProvider?: string;
  signatureEnvelopeId?: string;
  signedAt?: string;
  signedByName?: string;
  signedByEmail?: string;
  signedByDocument?: string;
  signatureUrl?: string | null;
}

function formatSignatureStatus(status?: string) {
  if (!status) return "-";

  const map: Record<string, string> = {
    draft: "Rascunho",
    pending: "Pendente",
    signed: "Assinado",
    rejected: "Rejeitado",
    cancelled: "Cancelado",
    canceled: "Cancelado",
    expired: "Expirado",
    unknown: "Desconhecido",
  };
  return map[status.toLowerCase()] || status;
}

function formatContractStatus(status: Contract["status"]) {
  const map: Record<Contract["status"], string> = {
    draft: "Rascunho",
    generated: "Gerado",
    pending_signature: "Pendente assinatura",
    signed: "Assinado",
    rejected: "Rejeitado",
    expired: "Expirado",
    canceled: "Cancelado",
  };
  return map[status] || status;
}

export function filterSignaturesBySearch(
  items: SignatureItem[],
  search: string,
) {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) return items;

  return items.filter((item) => {
    return (
      item.contractNumber.toLowerCase().includes(normalizedSearch) ||
      (item.signatureEnvelopeId || "")
        .toLowerCase()
        .includes(normalizedSearch) ||
      (item.signedByName || "").toLowerCase().includes(normalizedSearch) ||
      (item.signedByEmail || "").toLowerCase().includes(normalizedSearch)
    );
  });
}

export function getSignatureTableColumns(): DataTableColumn<SignatureItem>[] {
  return [
    {
      key: "contractNumber",
      label: signatureUiCopy.list.columns.contractNumber,
      render: (item) => item.contractNumber,
    },
    {
      key: "provider",
      label: signatureUiCopy.list.columns.provider,
      render: (item) => item.signatureProvider || "-",
    },
    {
      key: "signer",
      label: signatureUiCopy.list.columns.signer,
      render: (item) => item.signedByName || item.signedByEmail || "-",
    },
    {
      key: "signedByDocument",
      label: signatureUiCopy.list.columns.signedByDocument,
      render: (item) => item.signedByDocument || "-",
    },
    {
      key: "signedByEmail",
      label: signatureUiCopy.list.columns.signedByEmail,
      render: (item) => item.signedByEmail || "-",
    },
    {
      key: "signatureStatus",
      label: signatureUiCopy.list.columns.signatureStatus,
      render: (item) => formatSignatureStatus(item.signatureStatus),
    },
    {
      key: "signedAt",
      label: signatureUiCopy.list.columns.signedAt,
      render: (item) => formatDateTimeDisplay(item.signedAt || item.updatedAt),
    },
    {
      key: "contractStatus",
      label: signatureUiCopy.list.columns.contractStatus,
      render: (item) => formatContractStatus(item.contractStatus),
    },
    {
      key: "updatedAt",
      label: signatureUiCopy.list.columns.updatedAt,
      render: (item) => formatDateTimeDisplay(item.updatedAt),
    },
    {
      key: "signatureUrl",
      label: signatureUiCopy.list.columns.signatureUrl,
      render: (item) => {
        if (!item.signatureUrl) return "-";

        return (
          <div className="w-full flex justify-center">
            <button
              type="button"
              title="Copiar URL"
              aria-label="Copiar URL da assinatura"
              className="text-blue-400 hover:text-blue-600 flex items-center justify-center p-1"
              onClick={async (e) => {
                await navigator.clipboard.writeText(item.signatureUrl || "");
                const btn = e.currentTarget as HTMLButtonElement;
                const prev = btn.getAttribute("title") || "";
                btn.setAttribute("title", "Copiado!");
                setTimeout(() => btn.setAttribute("title", prev), 1500);
              }}
            >
              <CopyIcon className="w-5 h-5" />
            </button>
          </div>
        );
      },
    },
  ];
}
