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
import { budgetRoutePaths } from "@/router";
import { budgetUiCopy, useBudgetsList } from "@/features/budgets";
import { useBudgetsContext } from "@/features/budgets/context/useBudgetsContext";

export default function Budgets() {
  const {
    budgets,
    leads,
    loading,
    pagination,
    filters,
    setLimit,
    setFilters,
    clearFilters,
    nextPage,
    prevPage,
  } = useBudgetsContext();
  const navigate = useNavigate();
  const { search, setSearch, filteredBudgets, columns } = useBudgetsList({
    budgets,
    leads,
  });

  const statusOptions = [
    { value: "", label: "Todos os status" },
    { value: "draft", label: budgetUiCopy.form.options.draft },
    { value: "sent", label: budgetUiCopy.form.options.sent },
    { value: "approved", label: budgetUiCopy.form.options.approved },
    { value: "rejected", label: budgetUiCopy.form.options.rejected },
    { value: "expired", label: budgetUiCopy.form.options.expired },
    { value: "canceled", label: budgetUiCopy.form.options.canceled },
  ];

  return (
    <ManagementPanelTemplate
      title={budgetUiCopy.list.title}
      description={budgetUiCopy.list.description}
    >
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={budgetUiCopy.list.searchPlaceholder}
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
              onClick={() => navigate(budgetRoutePaths.create)}
            >
              {budgetUiCopy.list.newAction}
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
        onClear={() => {
          void clearFilters();
        }}
        hasActiveFilters={Boolean(
          filters.status ||
          filters.startDate ||
          filters.endDate ||
          filters.idLeads,
        )}
        extraFilters={
          <Select
            label="Lead"
            value={filters.idLeads}
            onChange={(event) => {
              void setFilters({ idLeads: event.target.value });
            }}
            wrapperClassName="xl:col-span-1"
          >
            <option value="">Todos os leads</option>
            {leads.map((lead) => (
              <option key={lead.idLeads} value={lead.idLeads}>
                {lead.name}
              </option>
            ))}
          </Select>
        }
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
            data={filteredBudgets}
            columns={columns}
            emptyMessage={budgetUiCopy.list.emptyMessage}
            getId={(budget) => budget.idBudgets}
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
