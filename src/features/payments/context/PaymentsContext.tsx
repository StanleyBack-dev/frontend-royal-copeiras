import { createContext, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import {
  usePayments,
  type UsePaymentsResult,
} from "@/hooks/payments/usePayments";

export const PaymentsContext = createContext<UsePaymentsResult | null>(null);

interface PaymentsProviderProps {
  children: ReactNode;
}

export function PaymentsProvider({ children }: PaymentsProviderProps) {
  const paymentsState = usePayments();

  return (
    <PaymentsContext.Provider value={paymentsState}>
      {children}
    </PaymentsContext.Provider>
  );
}

export function PaymentsProviderOutlet({ userId }: { userId?: string } = {}) {
  void userId;

  return (
    <PaymentsProvider>
      <Outlet />
    </PaymentsProvider>
  );
}
