import React from "react";

interface TableColumn<T> {
  key: keyof T | string;
  label: React.ReactNode;
  render?: (row: T) => React.ReactNode;
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

export default function Table<T>({
  columns,
  data,
  emptyMessage = "Nenhum registro encontrado",
  rowKey,
  onRowClick,
  className = "",
}: TableProps<T>) {
  const actionsColumn = columns.find((col) => col.key === "actions");
  const cardColumns = columns.filter((col) => col.key !== "actions");

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
            className="divide-y sm:hidden"
            style={{ borderColor: "#e8d5c9" }}
          >
            {data.map((row) => (
              <div
                key={rowKey(row)}
                className={`flex flex-col gap-3 p-4 ${onRowClick ? "cursor-pointer transition-colors hover:bg-amber-50" : ""}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {actionsColumn && (
                  <div className="flex items-center justify-end gap-2">
                    {getCellValue(actionsColumn, row)}
                  </div>
                )}
                <dl className="flex flex-col gap-2">
                  {cardColumns.map((col) => (
                    <div key={col.key as string}>
                      <dt
                        className="text-[11px] font-semibold uppercase tracking-wider"
                        style={{ color: "#7a4430" }}
                      >
                        {col.label}
                      </dt>
                      <dd className="text-sm" style={{ color: "#3f2a20" }}>
                        {getCellValue(col, row)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
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
