import { Link } from "react-router-dom";
import type { DataTableColumn } from "../../../components/organisms/DataTable";
import type { Contract } from "../../../api/contracts/schema";
import { contractRoutePaths } from "../../../router";
import { formatDateTimeDisplay } from "../../../utils/format";
import { signatureUiCopy } from "./messages";

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
      key: "signer",
      label: signatureUiCopy.list.columns.signer,
      render: (item) => item.signedByName || item.signedByEmail || "-",
    },
    {
      key: "provider",
      label: signatureUiCopy.list.columns.provider,
      render: (item) => item.signatureProvider || "-",
    },
    {
      key: "envelope",
      label: signatureUiCopy.list.columns.envelope,
      render: (item) => item.signatureEnvelopeId || "-",
    },
    {
      key: "signatureStatus",
      label: signatureUiCopy.list.columns.signatureStatus,
      render: (item) => formatSignatureStatus(item.signatureStatus),
    },
    {
      key: "contractStatus",
      label: signatureUiCopy.list.columns.contractStatus,
      render: (item) => formatContractStatus(item.contractStatus),
    },
    {
      key: "updatedAt",
      label: signatureUiCopy.list.columns.updatedAt,
      render: (item) => formatDateTimeDisplay(item.signedAt || item.updatedAt),
    },
    {
      key: "actions",
      label: signatureUiCopy.list.columns.actions,
      render: (item) => (
        <Link
          to={contractRoutePaths.edit(item.idContracts)}
          className="text-[#7a4430] hover:text-[#2c1810]"
          title={signatureUiCopy.actions.openContract}
        >
          Abrir
        </Link>
      ),
    },
  ];
}
