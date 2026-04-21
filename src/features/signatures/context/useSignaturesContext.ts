import { useContext } from "react";
import { SignaturesContext } from "./SignaturesContext";

export function useSignaturesContext() {
  const context = useContext(SignaturesContext);
  if (!context) {
    throw new Error(
      "useSignaturesContext deve ser usado dentro de SignaturesProvider",
    );
  }
  return context;
}
