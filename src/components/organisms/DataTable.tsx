import React from "react";
import Table from "../atoms/Table";

export interface DataTableColumn<T> {
  key: keyof T | string;
  label: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getId?: (row: T) => string | number;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export default function DataTable<T>({
  data,
  columns,
  getId,
  emptyMessage,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const rowKey =
    getId ||
    ((row: T) => {
      return (
        (row as { idCustomers?: string | number; id?: string | number })
          .idCustomers ??
        (row as { id?: string | number }).id ??
        String(Math.random())
      );
    });

  return (
    <Table
      columns={columns}
      data={data}
      rowKey={rowKey}
      emptyMessage={emptyMessage}
      onRowClick={onRowClick}
      className={className}
    />
  );
}
