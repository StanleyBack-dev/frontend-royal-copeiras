import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { Employee } from "../../../api/employees/schema";
import {
  filterEmployeesBySearch,
  getEmployeeTableColumns,
} from "../model/listing";

interface UseEmployeesListParams {
  employees: Employee[];
}

export function useEmployeesList({ employees }: UseEmployeesListParams) {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";

  const setSearch = useCallback(
    (value: string) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        if (value.trim()) {
          next.set("search", value);
        } else {
          next.delete("search");
        }

        return next;
      });
    },
    [setSearchParams],
  );

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
