import { useContext } from "react";
import { BudgetsContext } from "./BudgetsContext";

export function useBudgetsContext() {
  const context = useContext(BudgetsContext);

  if (!context) {
    throw new Error("useBudgetsContext must be used within BudgetsProvider");
  }

  return context;
}
