import type { DataTableColumn } from "../../../components/organisms/DataTable";
import type { Contract } from "../../../api/contracts/schema";
import { formatDateTimeDisplay } from "../../../utils/format";
import { signatureUiCopy } from "./messages";
import { getContractStatusLabel } from "../../contracts/model/status";
import CopyIcon from "../../../components/atoms/icons/CopyIcon";

export interface SignatureItem {
  idSignatures: string;
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
  signerType?: string;
}

export interface SignatureContractGroup {
  idContracts: string;
  contractNumber: string;
  contractStatus: Contract["status"];
  signatureProvider?: string;
  updatedAt: string;
  signers: SignatureItem[];
}

function isSignerSigned(signer: SignatureItem) {
  const status = (signer.signatureStatus || "").trim().toLowerCase();
  return status === "signed" || status === "completed";
}

/**
 * The client's own signer record — falls back to the first signer when
 * signerType isn't available (older records created before that field
 * existed), so the group always has a reasonable name to show.
 */
export function getClientSigner(
  group: Pick<SignatureContractGroup, "signers">,
) {
  return (
    group.signers.find(
      (signer) => (signer.signerType || "").toUpperCase() === "CLIENT",
    ) || group.signers[0]
  );
}

/**
 * A contract can have more than one signatory (e.g. contratante and
 * contratada each sign their own copy), which the API returns as one
 * SignatureItem per signer. Grouping by contract turns that into one row
 * per contract with the individual signers nested inside, instead of the
 * same contract repeated once per signer.
 */
export function groupSignaturesByContract(
  items: SignatureItem[],
): SignatureContractGroup[] {
  const groups = new Map<string, SignatureContractGroup>();

  for (const item of items) {
    const existing = groups.get(item.idContracts);
    if (!existing) {
      groups.set(item.idContracts, {
        idContracts: item.idContracts,
        contractNumber: item.contractNumber,
        contractStatus: item.contractStatus,
        signatureProvider: item.signatureProvider,
        updatedAt: item.updatedAt,
        signers: [item],
      });
      continue;
    }

    existing.signers.push(item);
    if (item.updatedAt > existing.updatedAt) {
      existing.updatedAt = item.updatedAt;
      existing.contractStatus = item.contractStatus;
    }
  }

  return Array.from(groups.values());
}

export function getSignedCount(group: SignatureContractGroup) {
  return group.signers.filter(isSignerSigned).length;
}

export function getSignatureStatusLabel(status?: string) {
  if (!status) return "-";

  const normalized = status.trim().toLowerCase();
  const map: Record<string, string> = {
    draft: "Rascunho",
    pending: "Pendente",
    in_progress: "Pendente",
    pending_signature: "Pendente",
    pending_signatures: "Pendente",
    signed: "Assinado",
    completed: "Assinado",
    rejected: "Rejeitado",
    declined: "Rejeitado",
    cancelled: "Cancelado",
    canceled: "Cancelado",
    expired: "Expirado",
    unknown: "Desconhecido",
  };
  return map[normalized] || status;
}

export { getContractStatusLabel };

function formatSignedAt(value?: string) {
  if (!value) return "-";

  const formatted = formatDateTimeDisplay(value);
  return formatted || "-";
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
      render: (item) => getSignatureStatusLabel(item.signatureStatus),
    },
    {
      key: "signedAt",
      label: signatureUiCopy.list.columns.signedAt,
      render: (item) => formatSignedAt(item.signedAt),
    },
    {
      key: "contractStatus",
      label: signatureUiCopy.list.columns.contractStatus,
      render: (item) => getContractStatusLabel(item.contractStatus),
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
