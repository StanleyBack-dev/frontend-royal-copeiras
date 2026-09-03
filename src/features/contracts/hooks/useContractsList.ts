import { useMemo, useState } from "react";
import type { Contract } from "../../../api/contracts/schema";
import type { Budget } from "../../../api/budgets/schema";
import type { Lead } from "../../../api/leads/schema";
import {
  filterContractsBySearch,
  getContractTableColumns,
} from "../model/listing";

export function useContractsList({
  contracts,
  leads = [],
  budgets = [],
}: {
  contracts: Contract[];
  leads?: Lead[];
  budgets?: Budget[];
}) {
  const [search, setSearch] = useState("");

  const filteredContracts = useMemo(
    () => filterContractsBySearch(contracts, search),
    [contracts, search],
  );

  const columns = useMemo(() => {
    const resolveLeadName = (contract: Contract) => {
      const idLeads =
        contract.idLeads ||
        budgets.find((budget) => budget.idBudgets === contract.idBudgets)
          ?.idLeads;

      if (!idLeads) {
        return "";
      }

      return leads.find((lead) => lead.idLeads === idLeads)?.name || "";
    };

    return getContractTableColumns(resolveLeadName);
  }, [leads, budgets]);

  return {
    search,
    setSearch,
    filteredContracts,
    columns,
  };
}
