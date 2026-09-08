import type { StatusBadgeTone } from "@/components/atoms/StatusBadge";
import type { PublicIntakeCodeStatus } from "@/api/public-intake/schema";

const PUBLIC_INTAKE_STATUS_DISPLAY: Record<
  PublicIntakeCodeStatus,
  { label: string; tone: StatusBadgeTone }
> = {
  pending: { label: "Aguardando", tone: "warning" },
  verified: { label: "Preenchendo", tone: "warning" },
  submitted: { label: "Recebido", tone: "success" },
  expired: { label: "Expirado", tone: "danger" },
  invalidated: { label: "Invalidado", tone: "danger" },
};

export function getPublicIntakeCodeStatusLabel(
  status: PublicIntakeCodeStatus,
): string {
  return PUBLIC_INTAKE_STATUS_DISPLAY[status]?.label || status;
}

export function getPublicIntakeCodeStatusTone(
  status: PublicIntakeCodeStatus,
): StatusBadgeTone {
  return PUBLIC_INTAKE_STATUS_DISPLAY[status]?.tone || "neutral";
}
