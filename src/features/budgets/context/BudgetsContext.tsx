import { createContext, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import {
  useBudgets,
  type UseBudgetsResult,
} from "../../../hooks/budgets/useBudgets";

export const BudgetsContext = createContext<UseBudgetsResult | null>(null);

interface BudgetsProviderProps {
  children: ReactNode;
}

export function BudgetsProvider({ children }: BudgetsProviderProps) {
  const budgetsState = useBudgets();

  return (
    <BudgetsContext.Provider value={budgetsState}>
      {children}
    </BudgetsContext.Provider>
  );
}

export function BudgetsProviderOutlet({ userId }: { userId?: string } = {}) {
  void userId;
  return (
    <BudgetsProvider>
      <Outlet />
    </BudgetsProvider>
  );
}
