import { useContext } from "react";
import { PublicIntakeContext } from "./PublicIntakeContext";

export function usePublicIntakeContext() {
  const context = useContext(PublicIntakeContext);
  if (!context) {
    throw new Error(
      "usePublicIntakeContext deve ser usado dentro de PublicIntakeProvider",
    );
  }
  return context;
}
