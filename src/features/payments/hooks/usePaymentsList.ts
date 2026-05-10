import { useMemo, useState } from "react";
import type { Payment } from "@/api/payments/schema";
import type { Budget } from "@/api/budgets/schema";
import type { Contract } from "@/api/contracts/schema";
import type { Event } from "@/api/events/schema";
import {
  filterPaymentsBySearch,
  getPaymentTableColumns,
} from "../model/listing";

export function usePaymentsList({
  payments,
  budgets,
  contracts,
  events,
}: {
  payments: Payment[];
  budgets: Budget[];
  contracts: Contract[];
  events: Event[];
}) {
  const [search, setSearch] = useState("");

  const filteredPayments = useMemo(
    () =>
      filterPaymentsBySearch(payments, search, { budgets, contracts, events }),
    [budgets, contracts, events, payments, search],
  );

  const columns = useMemo(
    () => getPaymentTableColumns({ budgets, contracts, events }),
    [budgets, contracts, events],
  );

  return {
    search,
    setSearch,
    filteredPayments,
    columns,
  };
}
