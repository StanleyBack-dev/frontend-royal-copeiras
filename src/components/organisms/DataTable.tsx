import React from "react";
import Table from "../atoms/Table";
import EditIcon from "../atoms/icons/EditIcon";
import DeleteIcon from "../atoms/icons/DeleteIcon";

export interface DataTableColumn<T> {
  key: keyof T | string;
  label: React.ReactNode;
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
  const columnsWithActions: DataTableColumn<T>[] =
    onEdit || onRemove
      ? [
          ...columns,
          {
            key: "__actions",
            label: "Ações",
            render: (row: T) => (
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(row)}
                    className="p-1 rounded hover:bg-[#f5ede8]"
                    title="Editar"
                    style={{ lineHeight: 0 }}
                  >
                    <EditIcon size={18} />
                  </button>
                )}
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(row)}
                    className="p-1 rounded hover:bg-[#f5ede8]"
                    title="Excluir"
                    style={{ lineHeight: 0 }}
                  >
                    <DeleteIcon size={18} />
                  </button>
                )}
              </div>
            ),
          },
        ]
      : columns;
  return <Table columns={columnsWithActions} data={data} rowKey={rowKey} />;
}
