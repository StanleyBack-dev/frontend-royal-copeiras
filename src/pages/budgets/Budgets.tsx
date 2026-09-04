import DataTable from "@/components/organisms/DataTable";
import FilterBar from "@/components/molecules/FilterBar";
import ListFiltersPanel from "@/components/molecules/ListFiltersPanel";
import ListPager from "@/components/molecules/ListPager";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import ManagementPanelTemplate from "@/components/templates/management/ManagementPanelTemplate";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { budgetRoutePaths } from "@/router";
import { budgetUiCopy, useBudgetsList } from "@/features/budgets";
import { fetchContracts } from "@/features/contracts/services/contract.service";
import type { Contract } from "@/api/contracts/schema";
import { useAuthSession } from "@/features/auth";
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

  useAuthSession();
  const [contracts, setContracts] = useState<Contract[] | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function loadContracts() {
      try {
        const result = await fetchContracts({ page: 1, limit: 100 });
        if (!cancelled) setContracts(result.items);
      } catch {
        // best-effort; keep contracts undefined
      }
    }

    void loadContracts();

    return () => {
      cancelled = true;
    };
  }, []);

  const { search, setSearch, filteredBudgets, columns } = useBudgetsList({
    budgets,
    leads,
    contracts,
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
        searchValue={search}
        searchPlaceholder={budgetUiCopy.list.searchPlaceholder}
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
        onClear={() => {
          setSearch("");
          void clearFilters();
        }}
        hasActiveFilters={Boolean(
          search ||
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
