import { useContext } from "react";
import { ContractsContext } from "./ContractsContext";

export function useContractsContext() {
  const context = useContext(ContractsContext);

  if (!context) {
    throw new Error(
      "useContractsContext must be used within ContractsProvider",
    );
  }

  return context;
}
