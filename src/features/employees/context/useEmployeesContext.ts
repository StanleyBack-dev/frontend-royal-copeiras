import { useContext } from "react";
import { EmployeesContext } from "./EmployeesContext";

export function useEmployeesContext() {
  const context = useContext(EmployeesContext);

  if (!context) {
    throw new Error(
      "useEmployeesContext deve ser usado dentro de EmployeesProvider",
    );
  }

  return context;
}
