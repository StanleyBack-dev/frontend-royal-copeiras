import { Link } from "react-router-dom";
import type { Payment } from "@/api/payments/schema";
import type { Budget } from "@/api/budgets/schema";
import type { Contract } from "@/api/contracts/schema";
import type { Event } from "@/api/events/schema";
import type { DataTableColumn } from "@/components/organisms/DataTable";
import EditIcon from "@/components/atoms/icons/EditIcon";
import { paymentRoutePaths } from "@/router";
import { formatDateTimeDisplay } from "@/utils/format";
import { paymentUiCopy } from "./messages";

type PaymentLookupData = {
  budgets: Budget[];
  contracts: Contract[];
  events: Event[];
};

function formatCurrency(value?: number) {
  const safeValue = Number.isFinite(value) ? Number(value) : 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(safeValue);
}

function getPaymentStatusLabel(status: Payment["status"]) {
  return paymentUiCopy.form.options.statuses[status] || status;
}

function getPaymentOriginLabel(origin: Payment["origin"]) {
  return paymentUiCopy.form.options.origins[origin] || origin;
}

function getPaymentTypesSummary(payment: Payment) {
  const items = payment.paymentItems ?? [];
  if (!items.length) {
    return getPaymentOriginLabel(payment.origin);
  }

  return items
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((item) => getPaymentOriginLabel(item.origin))
    .join(", ");
}

function getBudgetNumberById(budgets: Budget[], idBudgets?: string) {
  if (!idBudgets) {
    return "-";
  }

  return (
    budgets.find((budget) => budget.idBudgets === idBudgets)?.budgetNumber ||
    "-"
  );
}

function getEventNumberById(events: Event[], idEvents?: string) {
  if (!idEvents) {
    return "-";
  }

  return (
    events.find((event) => event.idEvents === idEvents)?.eventNumber || "-"
  );
}

function getContractNumberById(contracts: Contract[], idContracts?: string) {
  if (!idContracts) {
    return "-";
  }

  return (
    contracts.find((contract) => contract.idContracts === idContracts)
      ?.contractNumber || "-"
  );
}

export function filterPaymentsBySearch(
  payments: Payment[],
  search: string,
  lookup: PaymentLookupData,
) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return payments;
  }

  return payments.filter((payment) => {
    const paymentItemsOrigin = (payment.paymentItems ?? [])
      .map((item) => item.origin)
      .join(" ")
      .toLowerCase();
    const budgetNumber = getBudgetNumberById(
      lookup.budgets,
      payment.idBudgets,
    ).toLowerCase();
    const contractNumber = getContractNumberById(
      lookup.contracts,
      payment.idContracts,
    ).toLowerCase();
    const eventNumber = getEventNumberById(
      lookup.events,
      payment.idEvents,
    ).toLowerCase();

    return (
      payment.notes?.toLowerCase().includes(normalizedSearch) ||
      payment.origin.toLowerCase().includes(normalizedSearch) ||
      paymentItemsOrigin.includes(normalizedSearch) ||
      payment.status.toLowerCase().includes(normalizedSearch) ||
      budgetNumber.includes(normalizedSearch) ||
      contractNumber.includes(normalizedSearch) ||
      eventNumber.includes(normalizedSearch) ||
      payment.idBudgets?.toLowerCase().includes(normalizedSearch) ||
      payment.idContracts?.toLowerCase().includes(normalizedSearch)
    );
  });
}

export function getPaymentTableColumns(
  lookup: PaymentLookupData,
): DataTableColumn<Payment>[] {
  return [
    {
      key: "actions",
      label: paymentUiCopy.list.columns.actions,
      render: (payment) => (
        <Link
          to={paymentRoutePaths.edit(payment.idPayments)}
          title="Editar pagamento"
          className="hover:text-yellow-700"
          style={{ display: "flex", alignItems: "center" }}
        >
          <EditIcon size={18} />
        </Link>
      ),
    },
    {
      key: "eventNumber",
      label: paymentUiCopy.list.columns.eventNumber,
      render: (payment) => getEventNumberById(lookup.events, payment.idEvents),
    },
    {
      key: "contractNumber",
      label: paymentUiCopy.list.columns.contractNumber,
      render: (payment) =>
        getContractNumberById(lookup.contracts, payment.idContracts),
    },
    {
      key: "budgetNumber",
      label: paymentUiCopy.list.columns.budgetNumber,
      render: (payment) =>
        getBudgetNumberById(lookup.budgets, payment.idBudgets),
    },
    {
      key: "status",
      label: paymentUiCopy.list.columns.status,
      render: (payment) => getPaymentStatusLabel(payment.status),
    },
    {
      key: "origin",
      label: paymentUiCopy.list.columns.origin,
      render: (payment) => getPaymentTypesSummary(payment),
    },
    {
      key: "plannedAmount",
      label: paymentUiCopy.list.columns.plannedAmount,
      render: (payment) => formatCurrency(payment.plannedAmount),
    },
    {
      key: "paidAmount",
      label: paymentUiCopy.list.columns.paidAmount,
      render: (payment) => formatCurrency(payment.paidAmount),
    },
    {
      key: "createdAt",
      label: paymentUiCopy.list.columns.createdAt,
      render: (payment) => formatDateTimeDisplay(payment.createdAt),
    },
  ];
}
