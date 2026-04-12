import React from 'react';

interface TableColumn<T> {
  key: keyof T | string;
  label: string;
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

export default function Table<T>({ columns, data, emptyMessage = 'Nenhum registro encontrado', rowKey, onRowClick, className = '' }: TableProps<T>) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden ${className}`} style={{ borderColor: '#e8d5c9' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: '#f5ede8' }}>
            {columns.map(col => (
              <th key={col.key as string} className={`text-left px-6 py-3 font-semibold text-xs uppercase tracking-wider ${col.className || ''}`} style={{ color: '#7a4430' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: '#e8d5c9' }}>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-16 text-sm" style={{ color: '#9a7060' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map(row => (
              <tr key={rowKey(row)} className="hover:bg-amber-50 transition-colors cursor-pointer" onClick={onRowClick ? () => onRowClick(row) : undefined}>
                {columns.map(col => (
                  <td key={col.key as string} className="px-6 py-4">
                    {col.render ? col.render(row) : (row[col.key as keyof T] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
