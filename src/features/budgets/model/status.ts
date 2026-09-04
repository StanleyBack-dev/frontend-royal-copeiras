import type { StatusBadgeTone } from "@/components/atoms/StatusBadge";
import type { Budget } from "@/api/budgets/schema";

/**
 * The backend keeps 7 granular budget statuses (needed for the actual
 * state machine and transition rules), but that's more detail than an
 * operator needs at a glance — "generated" and "sent" read as the same
 * thing to them, and "rejected"/"expired"/"canceled" are all just "isso
 * não vai para frente". The UI collapses them into four buckets; nothing
 * about the underlying status values or transitions changes.
 */
const BUDGET_STATUS_DISPLAY: Record<
  Budget["status"],
  { label: string; tone: StatusBadgeTone }
> = {
  draft: { label: "Rascunho", tone: "neutral" },
  generated: { label: "Enviado", tone: "warning" },
  sent: { label: "Enviado", tone: "warning" },
  approved: { label: "Aprovado", tone: "success" },
  rejected: { label: "Encerrado", tone: "danger" },
  expired: { label: "Encerrado", tone: "danger" },
  canceled: { label: "Encerrado", tone: "danger" },
};

export function getBudgetStatusLabel(status: Budget["status"]): string {
  return BUDGET_STATUS_DISPLAY[status]?.label || status;
}

export function getBudgetStatusTone(status: Budget["status"]): StatusBadgeTone {
  return BUDGET_STATUS_DISPLAY[status]?.tone || "neutral";
}
