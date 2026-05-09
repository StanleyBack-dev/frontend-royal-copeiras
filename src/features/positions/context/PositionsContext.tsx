import { createContext, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import {
  usePositions,
  type UsePositionsResult,
} from "../../../hooks/positions/usePositions";

export const PositionsContext = createContext<UsePositionsResult | null>(null);

interface PositionsProviderProps {
  children: ReactNode;
}

export function PositionsProvider({ children }: PositionsProviderProps) {
  const positionsState = usePositions();

  return (
    <PositionsContext.Provider value={positionsState}>
      {children}
    </PositionsContext.Provider>
  );
}

export function PositionsProviderOutlet({ userId }: { userId?: string } = {}) {
  void userId;
  return (
    <PositionsProvider>
      <Outlet />
    </PositionsProvider>
  );
}
