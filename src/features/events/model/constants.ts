import type { EventStatus } from "../../../api/events/schema";

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  scheduled: "Agendado",
  in_progress: "Em andamento",
  completed: "Concluído",
  canceled: "Cancelado",
};

export const EVENT_STATUS_COLORS: Record<
  EventStatus,
  { bg: string; text: string; border: string }
> = {
  scheduled: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  in_progress: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
  },
  completed: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-300",
  },
  canceled: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
  },
};

export const ALL_EVENT_STATUSES: EventStatus[] = [
  "scheduled",
  "in_progress",
  "completed",
  "canceled",
];

const EVENT_STATUS_ALIASES: Record<string, EventStatus> = {
  scheduled: "scheduled",
  scheduling: "scheduled",
  in_progress: "in_progress",
  inprogress: "in_progress",
  completed: "completed",
  canceled: "canceled",
  cancelled: "canceled",
};

export function normalizeEventStatus(status: string): EventStatus | undefined {
  const normalized = status.trim().toLowerCase();
  return EVENT_STATUS_ALIASES[normalized];
}

export function getEventStatusLabel(status: string): string {
  const normalizedStatus = normalizeEventStatus(status);
  if (!normalizedStatus) return status;
  return EVENT_STATUS_LABELS[normalizedStatus];
}

export function getEventStatusColors(status: string) {
  const normalizedStatus = normalizeEventStatus(status);
  if (!normalizedStatus) return undefined;
  return EVENT_STATUS_COLORS[normalizedStatus];
}
