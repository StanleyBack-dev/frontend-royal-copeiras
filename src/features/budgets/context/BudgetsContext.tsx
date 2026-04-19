import { createContext, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import {
  useBudgets,
  type UseBudgetsResult,
} from "../../../hooks/budgets/useBudgets";

export const BudgetsContext = createContext<UseBudgetsResult | null>(null);

interface BudgetsProviderProps {
  userId: string;
  children: ReactNode;
}

export function BudgetsProvider({ userId, children }: BudgetsProviderProps) {
  const budgetsState = useBudgets(userId);

  return (
    <BudgetsContext.Provider value={budgetsState}>
      {children}
    </BudgetsContext.Provider>
  );
}

export function BudgetsProviderOutlet({ userId }: { userId: string }) {
  return (
    <BudgetsProvider userId={userId}>
      <Outlet />
    </BudgetsProvider>
  );
}
