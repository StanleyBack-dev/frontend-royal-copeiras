import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

interface TableColumn<T> {
  key: keyof T | string;
  label: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  /** Overrides `render` only for the mobile card title/subtitle; the desktop cell keeps using `render`. */
  mobileRender?: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  className?: string;
}

function getCellValue<T>(col: TableColumn<T>, row: T): React.ReactNode {
  return col.render
    ? col.render(row)
    : (row[col.key as keyof T] as React.ReactNode);
}

function getMobileCellValue<T>(col: TableColumn<T>, row: T): React.ReactNode {
  return col.mobileRender ? col.mobileRender(row) : getCellValue(col, row);
}

function MobileRow<T>({
  row,
  titleColumn,
  subtitleColumn,
  detailColumns,
  actionsColumn,
  onRowClick,
}: {
  row: T;
  titleColumn?: TableColumn<T>;
  subtitleColumn?: TableColumn<T>;
  detailColumns: TableColumn<T>[];
  actionsColumn?: TableColumn<T>;
  onRowClick?: (row: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const isExpandable = detailColumns.length > 0;

  function handleToggle() {
    if (isExpandable) {
      setOpen((current) => !current);
    }
    onRowClick?.(row);
  }

  return (
    <div
      className="overflow-hidden rounded-lg border bg-white"
      style={{ borderColor: "#e8d5c9" }}
    >
      <div
        role={isExpandable || onRowClick ? "button" : undefined}
        tabIndex={isExpandable || onRowClick ? 0 : undefined}
        onClick={handleToggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleToggle();
          }
        }}
        className={`flex w-full items-center gap-2 px-3 py-2.5 ${
          isExpandable || onRowClick
            ? "cursor-pointer transition-colors hover:bg-[#faf6f2]"
            : ""
        }`}
      >
        {isExpandable ? (
          <ChevronRight
            size={16}
            className={`shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
            style={{ color: "#C9A227" }}
          />
        ) : null}
        <div className="min-w-0 flex-1">
          {titleColumn ? (
            <div
              className="truncate text-sm font-semibold"
              style={{ color: "#2c1810" }}
            >
              {getMobileCellValue(titleColumn, row)}
            </div>
          ) : null}
          {subtitleColumn ? (
            <div
              className="text-xs [&>*]:truncate"
              style={{ color: "#9a7060" }}
            >
              {getMobileCellValue(subtitleColumn, row)}
            </div>
          ) : null}
        </div>
        {actionsColumn ? (
          <div
            className="flex shrink-0 items-center gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            {getCellValue(actionsColumn, row)}
          </div>
        ) : null}
      </div>

      {open ? (
        <dl
          className="divide-y border-t px-3"
          style={{ borderColor: "#f0e4dc" }}
        >
          {detailColumns.map((col) => (
            <div
              key={col.key as string}
              className="flex items-baseline justify-between gap-3 py-2"
            >
              <dt
                className="shrink-0 text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: "#7a4430" }}
              >
                {col.label}
              </dt>
              <dd
                className="min-w-0 flex-1 break-words text-right text-sm"
                style={{ color: "#3f2a20" }}
              >
                {getCellValue(col, row)}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

export default function Table<T>({
  columns,
  data,
  emptyMessage = "Nenhum registro encontrado",
  rowKey,
  onRowClick,
  className = "",
}: TableProps<T>) {
  const actionsColumn = columns.find((col) => col.key === "actions");
  const nonActionColumns = columns.filter((col) => col.key !== "actions");
  const [titleColumn, subtitleColumn, ...detailColumns] = nonActionColumns;

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white shadow-sm ${className}`}
      style={{ borderColor: "#e8d5c9" }}
    >
      {data.length === 0 ? (
        <p className="py-16 text-center text-sm" style={{ color: "#9a7060" }}>
          {emptyMessage}
        </p>
      ) : (
        <>
          <div
            className="flex flex-col gap-2 p-2 sm:hidden"
            style={{ background: "#faf6f2" }}
          >
            {data.map((row) => (
              <MobileRow
                key={rowKey(row)}
                row={row}
                titleColumn={titleColumn}
                subtitleColumn={subtitleColumn}
                detailColumns={detailColumns}
                actionsColumn={actionsColumn}
                onRowClick={onRowClick}
              />
            ))}
          </div>

          <div className="hidden w-full overflow-x-auto sm:block">
            <table className="min-w-[720px] w-full text-sm">
              <thead>
                <tr style={{ background: "#f5ede8" }}>
                  {columns.map((col) => (
                    <th
                      key={col.key as string}
                      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider sm:px-6 ${col.className || ""}`}
                      style={{ color: "#7a4430" }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "#e8d5c9" }}>
                {data.map((row) => (
                  <tr
                    key={rowKey(row)}
                    className="cursor-pointer transition-colors hover:bg-amber-50"
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((col) => (
                      <td key={col.key as string} className="px-4 py-4 sm:px-6">
                        {getCellValue(col, row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
