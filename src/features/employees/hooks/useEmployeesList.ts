import { useMemo, useState } from "react";
import type { Employee } from "../../../api/employees/schema";
import {
  filterEmployeesBySearch,
  getEmployeeTableColumns,
} from "../model/listing";

interface UseEmployeesListParams {
  employees: Employee[];
}

export function useEmployeesList({ employees }: UseEmployeesListParams) {
  const [search, setSearch] = useState("");

  const filteredEmployees = useMemo(
    () => filterEmployeesBySearch(employees, search),
    [employees, search],
  );

  const columns = useMemo(() => getEmployeeTableColumns(), []);

  return {
    search,
    setSearch,
    filteredEmployees,
    columns,
  };
}
