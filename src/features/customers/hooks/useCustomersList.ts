import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { Customer } from "../../../api/customers/schema";
import {
  filterCustomersBySearch,
  getCustomerTableColumns,
} from "../model/listing";

interface UseCustomersListParams {
  customers: Customer[];
}

export function useCustomersList({ customers }: UseCustomersListParams) {
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

  const filteredCustomers = useMemo(
    () => filterCustomersBySearch(customers, search),
    [customers, search],
  );

  const columns = useMemo(() => getCustomerTableColumns(), []);

  return {
    search,
    setSearch,
    filteredCustomers,
    columns,
  };
}
