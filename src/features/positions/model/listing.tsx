import { Link } from "react-router-dom";
import type { DataTableColumn } from "../../../components/organisms/DataTable";
import EditIcon from "../../../components/atoms/icons/EditIcon";
import { colors } from "../../../config";
import type { Position } from "../../../api/positions/schema";
import { positionRoutePaths } from "../../../router";
import { formatDateTimeDisplay } from "../../../utils/format";
import { positionUiCopy } from "./messages";

export function filterPositionsBySearch(positions: Position[], search: string) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return positions;
  }

  return positions.filter((position) =>
    position.name.toLowerCase().includes(normalizedSearch),
  );
}

export function getPositionTableColumns(): DataTableColumn<Position>[] {
  return [
    {
      key: "actions",
      label: positionUiCopy.listing.columns.actions,
      render: (position) => (
        <div className="flex gap-2">
          <Link
            to={positionRoutePaths.edit(position.idPositions)}
            title={positionUiCopy.listing.actions.edit}
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
      label: positionUiCopy.listing.columns.name,
      render: (position) => (
        <span style={{ color: colors.brown[800], fontWeight: 600 }}>
          {position.name}
        </span>
      ),
    },
    {
      key: "isActive",
      label: positionUiCopy.listing.columns.isActive,
      render: (position) =>
        position.isActive
          ? positionUiCopy.listing.values.active
          : positionUiCopy.listing.values.inactive,
    },
    {
      key: "createdAt",
      label: positionUiCopy.listing.columns.createdAt,
      render: (position) => formatDateTimeDisplay(position.createdAt),
    },
  ];
}
