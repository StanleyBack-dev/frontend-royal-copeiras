import { Link } from "react-router-dom";
import type { DataTableColumn } from "../../../components/organisms/DataTable";
import EmailIcon from "../../../components/atoms/icons/EmailIcon";
import PhoneIcon from "../../../components/atoms/icons/PhoneIcon";
import EditIcon from "../../../components/atoms/icons/EditIcon";
import { colors } from "../../../config";
import type { Lead } from "../../../api/leads/schema";
import { budgetRoutePaths, leadRoutePaths } from "../../../router";
import { formatDateTimeDisplay } from "../../../utils/format";
import { leadUiCopy } from "./messages";

export function filterLeadsBySearch(leads: Lead[], search: string) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return leads;
  }

  return leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(normalizedSearch) ||
      (lead.email || "").toLowerCase().includes(normalizedSearch) ||
      (lead.phone || "").includes(search) ||
      (lead.source || "").toLowerCase().includes(normalizedSearch),
  );
}

function getStatusLabel(status: Lead["status"]) {
  switch (status) {
    case "qualified":
      return leadUiCopy.form.options.qualified;
    case "won":
      return leadUiCopy.form.options.won;
    case "lost":
      return leadUiCopy.form.options.lost;
    case "new":
    default:
      return leadUiCopy.form.options.new;
  }
}

function getSourceLabel(source?: Lead["source"]) {
  if (!source) {
    return "-";
  }

  return leadUiCopy.form.sourceOptions[source];
}

export function getLeadTableColumns(): DataTableColumn<Lead>[] {
  return [
    {
      key: "name",
      label: leadUiCopy.listing.columns.name,
      render: (lead) => (
        <span style={{ color: colors.brown[800], fontWeight: 600 }}>
          {lead.name}
        </span>
      ),
    },
    {
      key: "source",
      label: leadUiCopy.listing.columns.source,
      render: (lead) => getSourceLabel(lead.source),
    },
    {
      key: "email",
      label: leadUiCopy.listing.columns.email,
      render: (lead) => (
        <span className="flex items-center gap-1">
          {lead.email || "-"}
          {lead.email ? <EmailIcon size={14} /> : null}
        </span>
      ),
    },
    {
      key: "phone",
      label: leadUiCopy.listing.columns.phone,
      render: (lead) => (
        <span className="flex items-center gap-1">
          {lead.phone || "-"}
          {lead.phone ? <PhoneIcon size={14} /> : null}
        </span>
      ),
    },
    {
      key: "status",
      label: leadUiCopy.listing.columns.status,
      render: (lead) => getStatusLabel(lead.status),
    },
    {
      key: "isActive",
      label: leadUiCopy.listing.columns.isActive,
      render: (lead) =>
        lead.isActive
          ? leadUiCopy.listing.values.active
          : leadUiCopy.listing.values.inactive,
    },
    {
      key: "createdAt",
      label: leadUiCopy.listing.columns.createdAt,
      render: (lead) => formatDateTimeDisplay(lead.createdAt),
    },
    {
      key: "actions",
      label: leadUiCopy.listing.columns.actions,
      render: (lead) => (
        <div className="flex gap-2">
          <Link
            to={`${budgetRoutePaths.create}?leadId=${lead.idLeads}`}
            title={leadUiCopy.listing.actions.createBudget}
            className="rounded-md border border-[#e8d5c9] px-2 py-1 text-xs font-semibold text-[#7a4430] transition hover:bg-[#f5ede8]"
          >
            Orçamento
          </Link>
          <Link
            to={leadRoutePaths.edit(lead.idLeads)}
            title={leadUiCopy.listing.actions.edit}
            className="hover:text-yellow-700"
            style={{ display: "flex", alignItems: "center" }}
          >
            <EditIcon size={18} />
          </Link>
        </div>
      ),
    },
  ];
}
