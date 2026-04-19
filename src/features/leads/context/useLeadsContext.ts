import { useContext } from "react";
import { LeadsContext } from "./LeadsContext";

export function useLeadsContext() {
  const context = useContext(LeadsContext);

  if (!context) {
    throw new Error("useLeadsContext must be used within LeadsProvider");
  }

  return context;
}
