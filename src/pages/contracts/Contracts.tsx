import DataTable from "@/components/organisms/DataTable";
import FilterBar from "@/components/molecules/FilterBar";
import ListFiltersPanel from "@/components/molecules/ListFiltersPanel";
import ListPager from "@/components/molecules/ListPager";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import ManagementPanelTemplate from "@/components/templates/management/ManagementPanelTemplate";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { contractUiCopy, useContractsList } from "@/features/contracts";
import { useContractsContext } from "@/features/contracts/context/useContractsContext";
import { contractRoutePaths } from "@/router";

export default function Contracts() {
  const {
    contracts,
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
  } = useContractsContext();
  const { search, setSearch, filteredContracts, columns } = useContractsList({
    contracts,
    leads,
    budgets,
  });

  const navigate = useNavigate();

  const statusOptions = [
    { value: "", label: "Todos os status" },
    { value: "draft", label: contractUiCopy.form.options.draft },
    { value: "generated", label: contractUiCopy.form.options.generated },
    {
      value: "pending_signature",
      label: contractUiCopy.form.options.pending_signature,
    },
    { value: "signed", label: contractUiCopy.form.options.signed },
    {
      value: "closed_without_signature",
      label: contractUiCopy.form.options.closed_without_signature,
    },
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
        actions={
          <div className="flex w-full gap-2 sm:w-auto">
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
        searchValue={search}
        searchPlaceholder={contractUiCopy.list.searchPlaceholder}
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
