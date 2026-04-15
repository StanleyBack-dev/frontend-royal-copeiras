import { useMemo, useState } from "react";
import type { Customer } from "../../../api/customers/schema";
import {
  filterCustomersBySearch,
  getCustomerTableColumns,
} from "../model/listing";

interface UseCustomersListParams {
  customers: Customer[];
}

export function useCustomersList({ customers }: UseCustomersListParams) {
  const [search, setSearch] = useState("");

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
