import { useContext } from "react";
import { CustomersContext } from "./CustomersContext";

export function useCustomersContext() {
  const context = useContext(CustomersContext);

  if (!context) {
    throw new Error(
      "useCustomersContext deve ser usado dentro de CustomersProvider",
    );
  }

  return context;
}
