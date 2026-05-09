import { useContext } from "react";
import { PositionsContext } from "./PositionsContext";

export function usePositionsContext() {
  const context = useContext(PositionsContext);
  if (!context) {
    throw new Error(
      "usePositionsContext deve ser usado dentro de PositionsProvider",
    );
  }
  return context;
}
