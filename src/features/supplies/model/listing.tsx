import { Link } from "react-router-dom";
import type { DataTableColumn } from "../../../components/organisms/DataTable";
import EditIcon from "../../../components/atoms/icons/EditIcon";
import { colors } from "../../../config";
import type { Supply } from "../../../api/supplies/schema";
import { supplyRoutePaths } from "../../../router";
import { formatDateTimeDisplay } from "../../../utils/format";
import { supplyUiCopy } from "./messages";

export function filterSuppliesBySearch(supplies: Supply[], search: string) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return supplies;
  }

  return supplies.filter((supply) =>
    supply.name.toLowerCase().includes(normalizedSearch),
  );
}

export function getSupplyTableColumns(): DataTableColumn<Supply>[] {
  return [
    {
      key: "actions",
      label: supplyUiCopy.listing.columns.actions,
      render: (supply) => (
        <div className="flex gap-2">
          <Link
            to={supplyRoutePaths.edit(supply.idSupplies)}
            title={supplyUiCopy.listing.actions.edit}
            className="hover:text-yellow-700"
            style={{ display: "flex", alignItems: "center" }}
          >
            <EditIcon size={18} />
          </Link>
        </div>
      ),
    },
    {
      key: "name",
      label: supplyUiCopy.listing.columns.name,
      render: (supply) => (
        <span style={{ color: colors.brown[800], fontWeight: 600 }}>
          {supply.name}
        </span>
      ),
    },
    {
      key: "defaultUnit",
      label: supplyUiCopy.listing.columns.defaultUnit,
      render: (supply) => supply.defaultUnit || "—",
    },
    {
      key: "isActive",
      label: supplyUiCopy.listing.columns.isActive,
      render: (supply) =>
        supply.isActive
          ? supplyUiCopy.listing.values.active
          : supplyUiCopy.listing.values.inactive,
    },
    {
      key: "createdAt",
      label: supplyUiCopy.listing.columns.createdAt,
      render: (supply) => formatDateTimeDisplay(supply.createdAt),
    },
  ];
}
