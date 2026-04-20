import { createContext, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import {
  useContracts,
  type UseContractsResult,
} from "../../../hooks/contracts/useContracts";

export const ContractsContext = createContext<UseContractsResult | null>(null);

interface ContractsProviderProps {
  userId: string;
  children: ReactNode;
}

export function ContractsProvider({
  userId,
  children,
}: ContractsProviderProps) {
  const contractsState = useContracts(userId);

  return (
    <ContractsContext.Provider value={contractsState}>
      {children}
    </ContractsContext.Provider>
  );
}

export function ContractsProviderOutlet({ userId }: { userId: string }) {
  return (
    <ContractsProvider userId={userId}>
      <Outlet />
    </ContractsProvider>
  );
}
