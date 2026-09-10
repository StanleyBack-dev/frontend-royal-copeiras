import { createContext, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import {
  useSupplies,
  type UseSuppliesResult,
} from "../../../hooks/supplies/useSupplies";

export const SuppliesContext = createContext<UseSuppliesResult | null>(null);

interface SuppliesProviderProps {
  children: ReactNode;
}

export function SuppliesProvider({ children }: SuppliesProviderProps) {
  const suppliesState = useSupplies();

  return (
    <SuppliesContext.Provider value={suppliesState}>
      {children}
    </SuppliesContext.Provider>
  );
}

export function SuppliesProviderOutlet({ userId }: { userId?: string } = {}) {
  void userId;
  return (
    <SuppliesProvider>
      <Outlet />
    </SuppliesProvider>
  );
}
