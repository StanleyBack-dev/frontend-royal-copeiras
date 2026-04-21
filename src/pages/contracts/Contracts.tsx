import DataTable from "@/components/organisms/DataTable";
import FilterBar from "@/components/molecules/FilterBar";
import ListFiltersPanel from "@/components/molecules/ListFiltersPanel";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import SearchIcon from "@/components/atoms/icons/SearchIcon";
import ManagementPanelTemplate from "@/components/templates/management/ManagementPanelTemplate";
import { colors } from "@/config";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { contractRoutePaths } from "@/router";
import { contractUiCopy, useContractsList } from "@/features/contracts";
import { useContractsContext } from "@/features/contracts/context/useContractsContext";

export default function Contracts() {
  const {
    contracts,
    budgets,
    loading,
    pagination,
    filters,
    setLimit,
    setFilters,
    clearFilters,
    nextPage,
    prevPage,
  } = useContractsContext();
  const navigate = useNavigate();
  const { search, setSearch, filteredContracts, columns } = useContractsList({
    contracts,
  });

  const statusOptions = [
    { value: "", label: "Todos os status" },
    { value: "draft", label: contractUiCopy.form.options.draft },
    { value: "generated", label: contractUiCopy.form.options.generated },
    {
      value: "pending_signature",
      label: contractUiCopy.form.options.pending_signature,
    },
    { value: "signed", label: contractUiCopy.form.options.signed },
    { value: "rejected", label: contractUiCopy.form.options.rejected },
    { value: "expired", label: contractUiCopy.form.options.expired },
    { value: "canceled", label: contractUiCopy.form.options.canceled },
  ];

  return (
    <ManagementPanelTemplate
      title={contractUiCopy.list.title}
      description={contractUiCopy.list.description}
    >
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={contractUiCopy.list.searchPlaceholder}
        searchIcon={
          <SearchIcon size={16} style={{ color: colors.brown[300] }} />
        }
        actions={
          <div className="flex w-full gap-2 sm:w-auto">
            {/* Botão Voltar removido */}
            <Button
              type="button"
              variant="primary"
              leftIcon={<Plus size={16} />}
              className="flex-1 sm:flex-none"
              onClick={() => navigate(contractRoutePaths.create)}
            >
              {contractUiCopy.list.newAction}
            </Button>
          </div>
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
          <div className="min-w-[240px]">
            <Select
              value={filters.idBudgets}
              onChange={(event) => {
                void setFilters({ idBudgets: event.target.value });
              }}
            >
              <option value="">Todos os orçamentos</option>
              {budgets.map((budget) => (
                <option key={budget.idBudgets} value={budget.idBudgets}>
                  {budget.budgetNumber}
                </option>
              ))}
            </Select>
          </div>
        }
        onClear={() => {
          void clearFilters();
        }}
        hasActiveFilters={Boolean(
          filters.status ||
          filters.startDate ||
          filters.endDate ||
          filters.idBudgets,
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
            data={filteredContracts}
            columns={columns}
            emptyMessage={contractUiCopy.list.emptyMessage}
            getId={(contract) => contract.idContracts}
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
