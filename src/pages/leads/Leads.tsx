import DataTable from "@/components/organisms/DataTable";
import FilterBar from "@/components/molecules/FilterBar";
import ListPager from "@/components/molecules/ListPager";
import ListFiltersPanel from "@/components/molecules/ListFiltersPanel";
import Button from "@/components/atoms/Button";
import ManagementPanelTemplate from "@/components/templates/management/ManagementPanelTemplate";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { leadRoutePaths } from "@/router";
import { leadUiCopy, useLeadsList } from "@/features/leads";
import { useLeadsContext } from "@/features/leads/context/useLeadsContext";

export default function Leads() {
  const {
    leads,
    loading,
    pagination,
    filters,
    setLimit,
    setFilters,
    clearFilters,
    nextPage,
    prevPage,
  } = useLeadsContext();
  const navigate = useNavigate();
  const { search, setSearch, filteredLeads, columns } = useLeadsList({ leads });

  const statusOptions = [
    { value: "", label: "Todos os status" },
    { value: "new", label: leadUiCopy.form.options.new },
    { value: "qualified", label: leadUiCopy.form.options.qualified },
    { value: "won", label: leadUiCopy.form.options.won },
    { value: "lost", label: leadUiCopy.form.options.lost },
  ];

  return (
    <ManagementPanelTemplate
      title={leadUiCopy.listing.title}
      description={leadUiCopy.listing.description}
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
              onClick={() => navigate(leadRoutePaths.create)}
            >
              {leadUiCopy.listing.newAction}
            </Button>
          </div>
        }
      />
      <ListFiltersPanel
        searchValue={search}
        searchPlaceholder={leadUiCopy.listing.searchPlaceholder}
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
          search || filters.status || filters.startDate || filters.endDate,
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
            data={filteredLeads}
            columns={columns}
            emptyMessage={leadUiCopy.listing.emptyMessage}
            getId={(lead) => lead.idLeads}
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
