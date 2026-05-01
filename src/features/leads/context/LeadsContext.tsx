import { createContext, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useLeads, type UseLeadsResult } from "../../../hooks/leads/useLeads";

export const LeadsContext = createContext<UseLeadsResult | null>(null);

interface LeadsProviderProps {
  children: ReactNode;
}

export function LeadsProvider({ children }: LeadsProviderProps) {
  const leadsState = useLeads();

  return (
    <LeadsContext.Provider value={leadsState}>{children}</LeadsContext.Provider>
  );
}

export function LeadsProviderOutlet({ userId }: { userId?: string } = {}) {
  void userId;
  return (
    <LeadsProvider>
      <Outlet />
    </LeadsProvider>
  );
}
