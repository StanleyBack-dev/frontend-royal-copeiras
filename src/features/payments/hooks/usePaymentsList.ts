import { useMemo, useState } from "react";
import type { Payment } from "@/api/payments/schema";
import type { Budget } from "@/api/budgets/schema";
import type { Contract } from "@/api/contracts/schema";
import type { Event } from "@/api/events/schema";
import type { Lead } from "@/api/leads/schema";
import {
  filterPaymentsBySearch,
  getPaymentTableColumns,
} from "../model/listing";

export function usePaymentsList({
  payments,
  budgets,
  contracts,
  events,
  leads,
}: {
  payments: Payment[];
  budgets: Budget[];
  contracts: Contract[];
  events: Event[];
  leads: Lead[];
}) {
  const [search, setSearch] = useState("");

  const filteredPayments = useMemo(
    () =>
      filterPaymentsBySearch(payments, search, {
        budgets,
        contracts,
        events,
        leads,
      }),
    [budgets, contracts, events, leads, payments, search],
  );

  const columns = useMemo(
    () => getPaymentTableColumns({ budgets, contracts, events, leads }),
    [budgets, contracts, events, leads],
  );

  return {
    search,
    setSearch,
    filteredPayments,
    columns,
  };
}
