import React from "react";
import Table from "../atoms/Table";
import Button from "../atoms/Button";

export interface DataTableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  onEdit?: (row: T) => void;
  onRemove?: (row: T) => void;
  getId?: (row: T) => string | number;
}

export default function DataTable<T>({
  data,
  columns,
  onEdit,
  onRemove,
  getId,
}: DataTableProps<T>) {
  const rowKey = getId || ((row: T) => {
    return (row as { idCustomers?: string | number; id?: string | number }).idCustomers
      ?? (row as { id?: string | number }).id
      ?? String(Math.random());
  });
  const columnsWithActions: DataTableColumn<T>[] = onEdit || onRemove
    ? [
        ...columns,
        {
          key: '__actions',
          label: 'Ações',
          render: (row: T) => (
            <div className="flex gap-2">
              {onEdit && (
                <Button size="sm" variant="secondary" onClick={() => onEdit(row)}>
                  Editar
                </Button>
              )}
              {onRemove && (
                <Button size="sm" variant="danger" onClick={() => onRemove(row)}>
                  Remover
                </Button>
              )}
            </div>
          ),
        },
      ]
    : columns;
  return (
    <Table
      columns={columnsWithActions}
      data={data}
      rowKey={rowKey}
    />
  );
}
