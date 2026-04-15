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

export default function Table<T>({
  columns,
  data,
  emptyMessage = "Nenhum registro encontrado",
  rowKey,
  onRowClick,
  className = "",
}: TableProps<T>) {
  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white shadow-sm ${className}`}
      style={{ borderColor: "#e8d5c9" }}
    >
      <div className="w-full overflow-x-auto">
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
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-16 text-center text-sm"
                  style={{ color: "#9a7060" }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="cursor-pointer transition-colors hover:bg-amber-50"
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td key={col.key as string} className="px-4 py-4 sm:px-6">
                      {col.render
                        ? col.render(row)
                        : (row[col.key as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
