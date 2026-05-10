import DataTable from "@/components/organisms/DataTable";
import FilterBar from "@/components/molecules/FilterBar";
import ListFiltersPanel from "@/components/molecules/ListFiltersPanel";
import Select from "@/components/atoms/Select";
import SearchIcon from "@/components/atoms/icons/SearchIcon";
import ManagementPanelTemplate from "@/components/templates/management/ManagementPanelTemplate";
import { colors } from "@/config";
import { paymentUiCopy, usePaymentsList } from "@/features/payments";
import { usePaymentsContext } from "@/features/payments/context/usePaymentsContext";

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
  const { search, setSearch, filteredPayments, columns } = usePaymentsList({
    payments,
    budgets,
    contracts,
    events,
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
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={paymentUiCopy.list.searchPlaceholder}
        searchIcon={
          <SearchIcon size={16} style={{ color: colors.brown[300] }} />
        }
      />

      <ListFiltersPanel
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
          void clearFilters();
        }}
        hasActiveFilters={Boolean(
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
          <div className="mt-4 flex items-center justify-between text-sm text-brown-700">
            <span>
              Pagina {pagination.currentPage} de{" "}
              {Math.max(pagination.totalPages, 1)}
              {" - "}
              {pagination.total} registros
            </span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2">
                <span>Itens:</span>
                <select
                  className="rounded border border-brown-300 bg-white px-2 py-1"
                  value={pagination.limit}
                  onChange={(event) => {
                    void setLimit(Number(event.target.value));
                  }}
                  disabled={loading}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </label>
              <button
                type="button"
                className="rounded border border-brown-300 px-3 py-1 disabled:opacity-50"
                onClick={() => {
                  void prevPage();
                }}
                disabled={loading || pagination.currentPage <= 1}
              >
                Anterior
              </button>
              <button
                type="button"
                className="rounded border border-brown-300 px-3 py-1 disabled:opacity-50"
                onClick={() => {
                  void nextPage();
                }}
                disabled={loading || !pagination.hasNextPage}
              >
                Proxima
              </button>
            </div>
          </div>
        </>
      )}
    </ManagementPanelTemplate>
  );
}
