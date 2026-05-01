import { createContext, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import {
  useEmployees,
  type UseEmployeesResult,
} from "../../../hooks/employees/useEmployees";

export const EmployeesContext = createContext<UseEmployeesResult | null>(null);

interface EmployeesProviderProps {
  children: ReactNode;
}

export function EmployeesProvider({ children }: EmployeesProviderProps) {
  const employeesState = useEmployees();

  return (
    <EmployeesContext.Provider value={employeesState}>
      {children}
    </EmployeesContext.Provider>
  );
}

export function EmployeesProviderOutlet({ userId }: { userId?: string } = {}) {
  void userId;
  return (
    <EmployeesProvider>
      <Outlet />
    </EmployeesProvider>
  );
}
