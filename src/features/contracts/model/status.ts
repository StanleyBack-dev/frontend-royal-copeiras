import type { StatusBadgeTone } from "@/components/atoms/StatusBadge";
import type { Contract } from "@/api/contracts/schema";

/**
 * The backend keeps 8 granular contract statuses (needed for the actual
 * state machine and transition rules), but that's more detail than an
 * operator needs at a glance — "generated" and "pending_signature" both
 * just mean "ainda não voltou assinado", and "closed_without_signature"/
 * "rejected"/"expired"/"canceled" are all "isso não vai para frente". The
 * UI collapses them into four buckets; nothing about the underlying
 * status values or transitions changes.
 */
const CONTRACT_STATUS_DISPLAY: Record<
  Contract["status"],
  { label: string; tone: StatusBadgeTone }
> = {
  draft: { label: "Rascunho", tone: "neutral" },
  generated: { label: "Enviado", tone: "warning" },
  pending_signature: { label: "Enviado", tone: "warning" },
  signed: { label: "Aprovado", tone: "success" },
  closed_without_signature: { label: "Encerrado", tone: "danger" },
  rejected: { label: "Encerrado", tone: "danger" },
  expired: { label: "Encerrado", tone: "danger" },
  canceled: { label: "Encerrado", tone: "danger" },
};

const CONTRACT_STATUS_ALIASES: Record<string, Contract["status"]> = {
  pendingsignature: "pending_signature",
  closedwithoutsignature: "closed_without_signature",
  cancelled: "canceled",
};

function normalizeContractStatus(status: string): Contract["status"] {
  const normalized = status.trim().toLowerCase();
  return (
    CONTRACT_STATUS_ALIASES[normalized] || (normalized as Contract["status"])
  );
}

export function getContractStatusLabel(status: string): string {
  const resolved = normalizeContractStatus(status);
  return CONTRACT_STATUS_DISPLAY[resolved]?.label || status;
}

export function getContractStatusTone(status: string): StatusBadgeTone {
  const resolved = normalizeContractStatus(status);
  return CONTRACT_STATUS_DISPLAY[resolved]?.tone || "neutral";
}
