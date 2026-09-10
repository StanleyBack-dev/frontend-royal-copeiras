import { useContext } from "react";
import { SuppliesContext } from "./SuppliesContext";

export function useSuppliesContext() {
  const context = useContext(SuppliesContext);
  if (!context) {
    throw new Error(
      "useSuppliesContext deve ser usado dentro de SuppliesProvider",
    );
  }
  return context;
}
