import { createContext, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import {
  useEmployees,
  type UseEmployeesResult,
} from "../../../hooks/employees/useEmployees";

export const EmployeesContext = createContext<UseEmployeesResult | null>(null);

interface EmployeesProviderProps {
  userId: string;
  children: ReactNode;
}

export function EmployeesProvider({
  userId,
  children,
}: EmployeesProviderProps) {
  const employeesState = useEmployees(userId);

  return (
    <EmployeesContext.Provider value={employeesState}>
      {children}
    </EmployeesContext.Provider>
  );
}

export function EmployeesProviderOutlet({ userId }: { userId: string }) {
  return (
    <EmployeesProvider userId={userId}>
      <Outlet />
    </EmployeesProvider>
  );
}
