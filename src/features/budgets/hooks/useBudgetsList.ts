import { useCallback, useMemo, useState } from "react";
import type { Budget } from "../../../api/budgets/schema";
import type { Lead } from "../../../api/leads/schema";
import { filterBudgetsBySearch, getBudgetTableColumns } from "../model/listing";

export function useBudgetsList({
  budgets,
  leads,
}: {
  budgets: Budget[];
  leads: Lead[];
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

  const columns = useMemo(
    () => getBudgetTableColumns(resolveLeadName),
    [resolveLeadName],
  );

  return {
    search,
    setSearch,
    filteredBudgets,
    columns,
    resolveLeadName,
  };
}
