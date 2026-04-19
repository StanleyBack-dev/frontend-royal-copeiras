import { useMemo, useState } from "react";
import type { Lead } from "../../../api/leads/schema";
import { filterLeadsBySearch, getLeadTableColumns } from "../model/listing";

export function useLeadsList({ leads }: { leads: Lead[] }) {
  const [search, setSearch] = useState("");

  const filteredLeads = useMemo(
    () => filterLeadsBySearch(leads, search),
    [leads, search],
  );

  const columns = useMemo(() => getLeadTableColumns(), []);

  return {
    search,
    setSearch,
    filteredLeads,
    columns,
  };
}
