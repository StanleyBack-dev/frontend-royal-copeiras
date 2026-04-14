import { useCallback, useMemo, useState } from "react";
import type { Customer } from "../../../api/customers/schema";
import { filterCustomersBySearch, getCustomerTableColumns } from "../model/listing";
import { customerUiCopy } from "../model/messages";

interface UseCustomersListParams {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

export function useCustomersList({
  customers,
  setCustomers,
}: UseCustomersListParams) {
  const [search, setSearch] = useState("");

  const removeCustomer = useCallback((id: string) => {
    if (!confirm(customerUiCopy.listing.confirmDelete)) {
      return;
    }

    // TODO: implementar deleção no backend/api
    setCustomers((previousCustomers) =>
      previousCustomers.filter((customer) => customer.idCustomers !== id),
    );
  }, [setCustomers]);

  const filteredCustomers = useMemo(
    () => filterCustomersBySearch(customers, search),
    [customers, search],
  );

  const columns = useMemo(
    () => getCustomerTableColumns({ onRemove: removeCustomer }),
    [removeCustomer],
  );

  return {
    search,
    setSearch,
    filteredCustomers,
    columns,
    removeCustomer,
  };
}
