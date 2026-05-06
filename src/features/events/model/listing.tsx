import type { DataTableColumn } from "../../../components/organisms/DataTable";
import type { Event } from "../../../api/events/schema";
import { eventUiCopy } from "./messages";
import { getEventStatusColors, getEventStatusLabel } from "./constants";
import {
  formatDateDisplay,
  formatDateTimeDisplay,
} from "../../../utils/format";

export type EventItem = Event;

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
      render: (item) => formatEventStatus(item.status),
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
      key: "customer",
      label: "Cliente",
      render: (item) => item.customerName || item.leadName || "-",
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
