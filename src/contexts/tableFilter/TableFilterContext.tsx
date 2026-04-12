import { createContext, useState, ReactNode } from 'react';
import type { TableFilterContextProps } from './TableFilterContext.types';

const TableFilterContext = createContext<TableFilterContextProps | undefined>(undefined);

export function TableFilterProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState('');
  return (
    <TableFilterContext.Provider value={{ search, setSearch }}>
      {children}
    </TableFilterContext.Provider>
  );
}

export { TableFilterContext };
