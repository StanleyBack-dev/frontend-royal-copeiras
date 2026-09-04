import DataTable from "@/components/organisms/DataTable";
import ListFiltersPanel from "@/components/molecules/ListFiltersPanel";
import ListPager from "@/components/molecules/ListPager";
import Select from "@/components/atoms/Select";
import ManagementPanelTemplate from "@/components/templates/management/ManagementPanelTemplate";
import { useEffect, useState } from "react";
import { paymentUiCopy, usePaymentsList } from "@/features/payments";
import { usePaymentsContext } from "@/features/payments/context/usePaymentsContext";
import { fetchLeads } from "@/features/leads/services/lead.service";
import type { Lead } from "@/api/leads/schema";

export default function Payments() {
  const {
    payments,
    budgets,
    contracts,
    events,
    loading,
    pagination,
    filters,
    setLimit,
    setFilters,
    clearFilters,
    nextPage,
    prevPage,
  } = usePaymentsContext();

  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadLeads() {
      try {
        const result = await fetchLeads({ page: 1, limit: 100 });
        if (!cancelled) setLeads(result.items);
      } catch {
        // best-effort; keep leads empty
      }
    }

    void loadLeads();

    return () => {
      cancelled = true;
    };
  }, []);

  const { search, setSearch, filteredPayments, columns } = usePaymentsList({
    payments,
    budgets,
    contracts,
    events,
    leads,
  });

  const statusOptions = [
    { value: "", label: "Todos os status" },
    {
      value: "pendente",
      label: paymentUiCopy.form.options.statuses.pendente,
    },
    { value: "parcial", label: paymentUiCopy.form.options.statuses.parcial },
    { value: "pago", label: paymentUiCopy.form.options.statuses.pago },
    {
      value: "cancelado",
      label: paymentUiCopy.form.options.statuses.cancelado,
    },
  ];

  return (
    <ManagementPanelTemplate
      title={paymentUiCopy.list.title}
      description={paymentUiCopy.list.description}
    >
      <ListFiltersPanel
        searchValue={search}
        searchPlaceholder={paymentUiCopy.list.searchPlaceholder}
        onSearchChange={setSearch}
        statusValue={filters.status}
        statusOptions={statusOptions}
        onStatusChange={(value) => {
          void setFilters({ status: value });
        }}
        startDateValue={filters.startDate}
        endDateValue={filters.endDate}
        onStartDateChange={(value) => {
          void setFilters({ startDate: value });
        }}
        onEndDateChange={(value) => {
          void setFilters({ endDate: value });
        }}
        extraFilters={
          <>
            <Select
              label="Orçamento"
              value={filters.idBudgets}
              onChange={(event) => {
                void setFilters({ idBudgets: event.target.value });
              }}
              wrapperClassName="xl:col-span-1"
            >
              <option value="">Todos os orçamentos</option>
              {budgets.map((budget) => (
                <option key={budget.idBudgets} value={budget.idBudgets}>
                  {budget.budgetNumber}
                </option>
              ))}
            </Select>
            <Select
              label="Contrato"
              value={filters.idContracts}
              onChange={(event) => {
                void setFilters({ idContracts: event.target.value });
              }}
              wrapperClassName="xl:col-span-1"
            >
              <option value="">Todos os contratos</option>
              {contracts.map((contract) => (
                <option key={contract.idContracts} value={contract.idContracts}>
                  {contract.contractNumber}
                </option>
              ))}
            </Select>
          </>
        }
        onClear={() => {
          setSearch("");
          void clearFilters();
        }}
        hasActiveFilters={Boolean(
          search ||
          filters.status ||
          filters.startDate ||
          filters.endDate ||
          filters.idBudgets ||
          filters.idContracts,
        )}
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2"
            style={{ borderColor: "#C9A227", borderTopColor: "transparent" }}
          />
        </div>
      ) : (
        <>
          <DataTable
            data={filteredPayments}
            columns={columns}
            emptyMessage={paymentUiCopy.list.emptyMessage}
            getId={(payment) => payment.idPayments}
          />
          <ListPager
            pagination={pagination}
            loading={loading}
            onLimitChange={(limit) => void setLimit(limit)}
            onPrev={() => void prevPage()}
            onNext={() => void nextPage()}
          />
        </>
      )}
    </ManagementPanelTemplate>
  );
}
