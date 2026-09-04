import { useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import CopyIcon from "@/components/atoms/icons/CopyIcon";
import StatusBadge, {
  type StatusBadgeTone,
} from "@/components/atoms/StatusBadge";
import { formatDateTimeDisplay } from "@/utils/format";
import {
  getClientSigner,
  getContractStatusLabel,
  getSignatureStatusLabel,
  getSignedCount,
  type SignatureContractGroup,
  type SignatureItem,
} from "../model/listing";
import { getContractStatusTone as contractStatusTone } from "../../contracts/model/status";

function signatureStatusTone(status?: string): StatusBadgeTone {
  const normalized = (status || "").trim().toLowerCase();
  if (normalized === "signed" || normalized === "completed") return "success";
  if (
    ["rejected", "declined", "cancelled", "canceled", "expired"].includes(
      normalized,
    )
  ) {
    return "danger";
  }
  return "warning";
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt
        className="shrink-0 text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: "#7a4430" }}
      >
        {label}
      </dt>
      <dd
        className="min-w-0 flex-1 break-words text-right text-sm"
        style={{ color: "#3f2a20" }}
      >
        {value}
      </dd>
    </div>
  );
}

function SignerCard({ signer }: { signer: SignatureItem }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="rounded-md p-3" style={{ background: "#faf6f2" }}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold" style={{ color: "#2c1810" }}>
          {signer.signedByName || signer.signedByEmail || "Signatário"}
        </span>
        <StatusBadge
          label={getSignatureStatusLabel(signer.signatureStatus)}
          tone={signatureStatusTone(signer.signatureStatus)}
        />
      </div>
      <dl>
        <DetailRow label="Documento" value={signer.signedByDocument || "-"} />
        <DetailRow label="E-mail" value={signer.signedByEmail || "-"} />
        <DetailRow
          label="Assinado em"
          value={signer.signedAt ? formatDateTimeDisplay(signer.signedAt) : "-"}
        />
        <DetailRow
          label="URL da assinatura"
          value={
            signer.signatureUrl ? (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    signer.signatureUrl || "",
                  );
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                <CopyIcon className="h-4 w-4" />
                {copied ? "Copiado!" : "Copiar"}
              </button>
            ) : (
              "-"
            )
          }
        />
      </dl>
    </div>
  );
}

function ContractGroupRow({ group }: { group: SignatureContractGroup }) {
  const [open, setOpen] = useState(false);
  const signedCount = getSignedCount(group);
  const clientSigner = getClientSigner(group);
  const clientName = clientSigner?.signedByName || clientSigner?.signedByEmail;

  return (
    <div
      className="overflow-hidden rounded-lg border bg-white"
      style={{ borderColor: "#e8d5c9" }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((current) => !current);
          }
        }}
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#faf6f2]"
      >
        <ChevronRight
          size={16}
          className={`shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
          style={{ color: "#C9A227" }}
        />
        <div className="min-w-0 flex-1">
          <div
            className="truncate text-sm font-semibold"
            style={{ color: "#2c1810" }}
          >
            {group.contractNumber}
            {clientName ? ` — ${clientName}` : ""}
          </div>
          <div className="truncate text-xs" style={{ color: "#9a7060" }}>
            {group.signatureProvider || "-"} · {signedCount}/
            {group.signers.length} assinado
            {group.signers.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {open ? (
        <div
          className="flex flex-col gap-2 border-t p-2"
          style={{ borderColor: "#f0e4dc" }}
        >
          <div className="flex items-center justify-between gap-2 px-1 py-1">
            <span
              className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: "#7a4430" }}
            >
              Status do contrato
            </span>
            <StatusBadge
              label={getContractStatusLabel(group.contractStatus)}
              tone={contractStatusTone(group.contractStatus)}
            />
          </div>
          {group.signers.map((signer) => (
            <SignerCard key={signer.idSignatures} signer={signer} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface SignatureGroupListProps {
  groups: SignatureContractGroup[];
  emptyMessage: string;
}

export default function SignatureGroupList({
  groups,
  emptyMessage,
}: SignatureGroupListProps) {
  return (
    <div
      className="overflow-hidden rounded-xl border bg-white shadow-sm"
      style={{ borderColor: "#e8d5c9" }}
    >
      {groups.length === 0 ? (
        <p className="py-16 text-center text-sm" style={{ color: "#9a7060" }}>
          {emptyMessage}
        </p>
      ) : (
        <div className="flex flex-col gap-2 p-2">
          {groups.map((group) => (
            <ContractGroupRow key={group.idContracts} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
