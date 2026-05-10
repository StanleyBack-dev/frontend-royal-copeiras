import { useContext } from "react";
import { PaymentsContext } from "./PaymentsContext";

export function usePaymentsContext() {
  const context = useContext(PaymentsContext);

  if (!context) {
    throw new Error("usePaymentsContext must be used within PaymentsProvider");
  }

  return context;
}
