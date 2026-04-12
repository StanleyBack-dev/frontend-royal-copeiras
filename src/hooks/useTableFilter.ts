import { useContext } from 'react';
import { TableFilterContext } from '../contexts/tableFilter/TableFilterContext';

export function useTableFilter() {
  const ctx = useContext(TableFilterContext);
  if (!ctx) throw new Error('useTableFilter must be used within TableFilterProvider');
  return ctx;
}
