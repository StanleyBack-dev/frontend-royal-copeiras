import { Link } from "react-router-dom";
import type { DataTableColumn } from "../../../components/organisms/DataTable";
import EditIcon from "../../../components/atoms/icons/EditIcon";
import { colors } from "../../../config";
import type { Budget } from "../../../api/budgets/schema";
import { budgetRoutePaths } from "../../../router";
import { formatDateTimeDisplay } from "../../../utils/format";
import { budgetUiCopy } from "./messages";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getBudgetStatusLabel(status: Budget["status"]) {
  return budgetUiCopy.form.options[status];
}

export function filterBudgetsBySearch(
  budgets: Budget[],
  search: string,
  resolveLeadName: (idLeads?: string) => string,
) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return budgets;
  }

  return budgets.filter((budget) => {
    const leadName = resolveLeadName(budget.idLeads).toLowerCase();
    return (
      budget.budgetNumber.toLowerCase().includes(normalizedSearch) ||
      (budget.eventLocation || "").toLowerCase().includes(normalizedSearch) ||
      leadName.includes(normalizedSearch)
    );
  });
}

export function getBudgetTableColumns(
  resolveLeadName: (idLeads?: string) => string,
): DataTableColumn<Budget>[] {
  return [
    {
      key: "budgetNumber",
      label: budgetUiCopy.list.columns.budgetNumber,
      render: (budget) => (
        <span style={{ color: colors.brown[800], fontWeight: 600 }}>
          {budget.budgetNumber}
        </span>
      ),
    },
    {
      key: "lead",
      label: budgetUiCopy.list.columns.lead,
      render: (budget) => resolveLeadName(budget.idLeads),
    },
    {
      key: "status",
      label: budgetUiCopy.list.columns.status,
      render: (budget) => getBudgetStatusLabel(budget.status),
    },
    {
      key: "eventLocation",
      label: budgetUiCopy.list.columns.eventLocation,
      render: (budget) => budget.eventLocation || "-",
    },
    {
      key: "totalAmount",
      label: budgetUiCopy.list.columns.totalAmount,
      render: (budget) => formatCurrency(budget.totalAmount),
    },
    {
      key: "validUntil",
      label: budgetUiCopy.list.columns.validUntil,
      render: (budget) => formatDateTimeDisplay(budget.validUntil),
    },
    {
      key: "actions",
      label: budgetUiCopy.list.columns.actions,
      render: (budget) => (
        <Link
          to={budgetRoutePaths.edit(budget.idBudgets)}
          title="Editar orçamento"
          className="hover:text-yellow-700"
          style={{ display: "flex", alignItems: "center" }}
        >
          <EditIcon size={18} />
        </Link>
      ),
    },
  ];
}
