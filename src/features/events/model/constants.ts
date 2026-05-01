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
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  completed: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  canceled: {
    bg: "bg-gray-50",
    text: "text-gray-500",
    border: "border-gray-200",
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
