import { createContext, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import {
  useCustomers,
  type UseCustomersResult,
} from "../../../hooks/customers/useCustomers";

export const CustomersContext = createContext<UseCustomersResult | null>(null);

interface CustomersProviderProps {
  userId: string;
  children: ReactNode;
}

export function CustomersProvider({
  userId,
  children,
}: CustomersProviderProps) {
  const customersState = useCustomers(userId);

  return (
    <CustomersContext.Provider value={customersState}>
      {children}
    </CustomersContext.Provider>
  );
}

export function CustomersProviderOutlet({ userId }: { userId: string }) {
  return (
    <CustomersProvider userId={userId}>
      <Outlet />
    </CustomersProvider>
  );
}
