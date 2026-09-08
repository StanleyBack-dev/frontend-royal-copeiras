import { Link } from "react-router-dom";
import type { DataTableColumn } from "@/components/organisms/DataTable";
import StatusBadge from "@/components/atoms/StatusBadge";
import type { PublicIntakeCodeListItem } from "@/api/public-intake/schema";
import { budgetRoutePaths, leadRoutePaths } from "@/router";
import { formatDateTimeDisplay } from "@/utils/format";
import { publicIntakeUiCopy } from "./messages";
import {
  getPublicIntakeCodeStatusLabel,
  getPublicIntakeCodeStatusTone,
} from "./status";

export function getPublicIntakeCodeTableColumns(): DataTableColumn<PublicIntakeCodeListItem>[] {
  return [
    {
      key: "code",
      label: publicIntakeUiCopy.list.columns.code,
      render: (item) => (
        <span className="font-mono font-semibold tracking-wider">
          {item.code}
        </span>
      ),
    },
    {
      key: "status",
      label: publicIntakeUiCopy.list.columns.status,
      render: (item) => (
        <StatusBadge
          label={getPublicIntakeCodeStatusLabel(item.status)}
          tone={getPublicIntakeCodeStatusTone(item.status)}
        />
      ),
    },
    {
      key: "expiresAt",
      label: publicIntakeUiCopy.list.columns.expiresAt,
      render: (item) => formatDateTimeDisplay(item.expiresAt),
    },
    {
      key: "result",
      label: publicIntakeUiCopy.list.columns.result,
      render: (item) => {
        if (!item.resultingLeadId) return "-";

        return (
          <Link
            to={leadRoutePaths.edit(item.resultingLeadId)}
            className="text-blue-500 underline hover:text-blue-700"
          >
            Ver lead
          </Link>
        );
      },
      mobileRender: (item) => {
        if (!item.resultingLeadId) return null;

        return (
          <span className="flex flex-wrap gap-2">
            <Link
              to={leadRoutePaths.edit(item.resultingLeadId)}
              className="text-blue-500 underline"
            >
              Lead
            </Link>
            {item.resultingBudgetId ? (
              <Link
                to={budgetRoutePaths.edit(item.resultingBudgetId)}
                className="text-blue-500 underline"
              >
                Orçamento
              </Link>
            ) : null}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: publicIntakeUiCopy.list.columns.createdAt,
      render: (item) => formatDateTimeDisplay(item.createdAt),
    },
  ];
}
