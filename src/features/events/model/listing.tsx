import type { DataTableColumn } from "../../../components/organisms/DataTable";
import type { Event, EventStatus } from "../../../api/events/schema";
import { eventUiCopy } from "./messages";
import {
  ALL_EVENT_STATUSES,
  EVENT_STATUS_LABELS,
  getEventStatusColors,
  getEventStatusLabel,
  normalizeEventStatus,
} from "./constants";
import {
  formatDateDisplay,
  formatDateTimeDisplay,
} from "../../../utils/format";

export type EventItem = Event;

function getEventOrderTimestamp(item: EventItem): number {
  const eventDates = item.eventDates ?? [];
  const eventDateTimestamps = eventDates
    .map((date) => Date.parse(`${date}T12:00:00`))
    .filter((value) => Number.isFinite(value));

  if (eventDateTimestamps.length > 0) {
    return Math.max(...eventDateTimestamps);
  }

  return Date.parse(item.createdAt) || 0;
}

export function sortEventsByNearestDate(items: EventItem[]): EventItem[] {
  return [...items].sort((left, right) => {
    const byEventDate =
      getEventOrderTimestamp(right) - getEventOrderTimestamp(left);

    if (byEventDate !== 0) {
      return byEventDate;
    }

    return Date.parse(right.createdAt) - Date.parse(left.createdAt);
  });
}

function formatCurrencyBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatEventDates(dates?: string[] | null): string {
  if (!dates || dates.length === 0) return "-";
  return dates.map((d) => formatDateDisplay(d) || d).join(", ");
}

export function formatEventStatus(status: string): React.ReactNode {
  const label = getEventStatusLabel(status);
  const colors = getEventStatusColors(status);

  if (!colors) {
    return <span>{label}</span>;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {label}
    </span>
  );
}

export function filterEventsBySearch(items: EventItem[], search: string) {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) return items;

  return items.filter((item) => {
    return (
      (item.contractNumber || "").toLowerCase().includes(normalizedSearch) ||
      (item.budgetNumber || "").toLowerCase().includes(normalizedSearch) ||
      (item.eventLocation || "").toLowerCase().includes(normalizedSearch) ||
      (item.customerName || "").toLowerCase().includes(normalizedSearch)
    );
  });
}

export function getEventTableColumns(
  onDetail: (item: EventItem) => void,
  onStatusChange?: (item: EventItem, status: EventStatus) => void,
  updatingEventStatusIds?: Set<string>,
): DataTableColumn<EventItem>[] {
  return [
    {
      key: "actions",
      label: eventUiCopy.list.columns.actions,
      render: (item) => (
        <button
          type="button"
          onClick={() => onDetail(item)}
          className="rounded-lg border border-[#e8d5c9] bg-[#faf6f2] px-3 py-1.5 text-xs font-medium text-[#7a4430] transition-colors hover:bg-[#e8d5c9]"
        >
          Ver detalhes
        </button>
      ),
    },
    {
      key: "contractNumber",
      label: eventUiCopy.list.columns.contractNumber,
      render: (item) => item.contractNumber || "-",
    },
    {
      key: "budgetNumber",
      label: eventUiCopy.list.columns.budgetNumber,
      render: (item) => item.budgetNumber || "-",
    },
    {
      key: "status",
      label: eventUiCopy.list.columns.status,
      render: (item) => {
        if (!onStatusChange) {
          return formatEventStatus(item.status);
        }

        const normalizedStatus = normalizeEventStatus(item.status);
        const selectedStatus = normalizedStatus ?? ALL_EVENT_STATUSES[0];
        const isUpdating = updatingEventStatusIds?.has(item.idEvents) ?? false;
        const selectedStatusColors = getEventStatusColors(selectedStatus);

        return (
          <div className="flex min-w-[190px] flex-col items-center gap-1">
            <select
              className={`w-full rounded-lg border px-3 py-1.5 text-center text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#7a4430]/20 ${
                selectedStatusColors
                  ? `${selectedStatusColors.bg} ${selectedStatusColors.text} ${selectedStatusColors.border}`
                  : "border-[#d9bda8] bg-white text-[#7a4430]"
              }`}
              value={selectedStatus}
              disabled={isUpdating}
              onChange={(event) => {
                const nextStatus = event.target.value as EventStatus;
                if (nextStatus === selectedStatus) {
                  return;
                }
                onStatusChange(item, nextStatus);
              }}
            >
              {ALL_EVENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {EVENT_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            {isUpdating ? (
              <span className="w-full text-center text-[11px] font-semibold uppercase tracking-wide text-[#7a4430]">
                Atualizando
              </span>
            ) : null}
          </div>
        );
      },
    },
    {
      key: "customer",
      label: "Cliente",
      render: (item) => item.customerName || item.leadName || "-",
    },
    {
      key: "eventLocation",
      label: eventUiCopy.list.columns.eventLocation,
      render: (item) => item.eventLocation || "-",
    },
    {
      key: "eventDates",
      label: eventUiCopy.list.columns.eventDates,
      render: (item) => formatEventDates(item.eventDates),
    },
    {
      key: "totalRevenue",
      label: eventUiCopy.list.columns.totalRevenue,
      render: (item) => formatCurrencyBRL(item.totalRevenue),
    },
    {
      key: "totalCost",
      label: eventUiCopy.list.columns.totalCost,
      render: (item) => formatCurrencyBRL(item.totalCost),
    },
    {
      key: "companyReceivable",
      label: eventUiCopy.list.columns.companyReceivable,
      render: (item) => formatCurrencyBRL(item.companyReceivable),
    },
    {
      key: "createdAt",
      label: eventUiCopy.list.columns.createdAt,
      render: (item) => formatDateTimeDisplay(item.createdAt),
    },
  ];
}
