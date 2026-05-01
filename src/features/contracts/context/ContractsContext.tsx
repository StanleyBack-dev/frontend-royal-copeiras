import { createContext, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import {
  useContracts,
  type UseContractsResult,
} from "../../../hooks/contracts/useContracts";

export const ContractsContext = createContext<UseContractsResult | null>(null);

interface ContractsProviderProps {
  children: ReactNode;
}

export function ContractsProvider({ children }: ContractsProviderProps) {
  const contractsState = useContracts();

  return (
    <ContractsContext.Provider value={contractsState}>
      {children}
    </ContractsContext.Provider>
  );
}

export function ContractsProviderOutlet({ userId }: { userId?: string } = {}) {
  void userId;
  return (
    <ContractsProvider>
      <Outlet />
    </ContractsProvider>
  );
}
