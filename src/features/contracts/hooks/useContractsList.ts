import { useMemo, useState } from "react";
import type { Contract } from "../../../api/contracts/schema";
import {
  filterContractsBySearch,
  getContractTableColumns,
} from "../model/listing";

export function useContractsList({ contracts }: { contracts: Contract[] }) {
  const [search, setSearch] = useState("");

  const filteredContracts = useMemo(
    () => filterContractsBySearch(contracts, search),
    [contracts, search],
  );

  const columns = useMemo(() => getContractTableColumns(), []);

  return {
    search,
    setSearch,
    filteredContracts,
    columns,
  };
}
