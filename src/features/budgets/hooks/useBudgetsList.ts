import { useCallback, useMemo, useState } from "react";
import type { Budget } from "../../../api/budgets/schema";
import type { Lead } from "../../../api/leads/schema";
import type { Contract } from "../../../api/contracts/schema";
import { filterBudgetsBySearch, getBudgetTableColumns } from "../model/listing";

export function useBudgetsList({
  budgets,
  leads,
  contracts,
}: {
  budgets: Budget[];
  leads: Lead[];
  contracts?: Contract[];
}) {
  const [search, setSearch] = useState("");

  const leadsMap = useMemo(
    () => new Map(leads.map((lead) => [lead.idLeads, lead.name])),
    [leads],
  );

  const resolveLeadName = useCallback(
    (idLeads?: string) => {
      if (!idLeads) {
        return "Sem lead vinculado";
      }

      return leadsMap.get(idLeads) || "Lead não encontrado";
    },
    [leadsMap],
  );

  const filteredBudgets = useMemo(
    () => filterBudgetsBySearch(budgets, search, resolveLeadName),
    [budgets, search, resolveLeadName],
  );

  const contractsMap = useMemo(() => {
    const map = new Map<
      string,
      { idContracts: string; contractNumber: string }
    >();
    if (contracts) {
      for (const c of contracts) {
        map.set(c.idBudgets, {
          idContracts: c.idContracts,
          contractNumber: c.contractNumber,
        });
      }
    }
    return map;
  }, [contracts]);

  const resolveContract = useCallback(
    (idBudgets?: string) => {
      if (!idBudgets) return undefined;
      return contractsMap.get(idBudgets);
    },
    [contractsMap],
  );

  const columns = useMemo(
    () => getBudgetTableColumns(resolveLeadName, resolveContract),
    [resolveLeadName, resolveContract],
  );

  return {
    search,
    setSearch,
    filteredBudgets,
    columns,
    resolveLeadName,
  };
}
