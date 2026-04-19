import { createContext, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useLeads, type UseLeadsResult } from "../../../hooks/leads/useLeads";

export const LeadsContext = createContext<UseLeadsResult | null>(null);

interface LeadsProviderProps {
  userId: string;
  children: ReactNode;
}

export function LeadsProvider({ userId, children }: LeadsProviderProps) {
  const leadsState = useLeads(userId);

  return (
    <LeadsContext.Provider value={leadsState}>{children}</LeadsContext.Provider>
  );
}

export function LeadsProviderOutlet({ userId }: { userId: string }) {
  return (
    <LeadsProvider userId={userId}>
      <Outlet />
    </LeadsProvider>
  );
}
