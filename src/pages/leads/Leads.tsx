import DataTable from "@/components/organisms/DataTable";
import FilterBar from "@/components/molecules/FilterBar";
import ListFiltersPanel from "@/components/molecules/ListFiltersPanel";
import Button from "@/components/atoms/Button";
import ManagementPanelTemplate from "@/components/templates/management/ManagementPanelTemplate";
import SearchIcon from "@/components/atoms/icons/SearchIcon";
import { colors } from "@/config";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { leadRoutePaths, routePaths } from "@/router";
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
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={leadUiCopy.listing.searchPlaceholder}
        searchIcon={
          <SearchIcon size={16} style={{ color: colors.brown[300] }} />
        }
        actions={
          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              leftIcon={<ArrowLeft size={16} />}
              className="flex-1 sm:flex-none"
              onClick={() => navigate(routePaths.events)}
            >
              Voltar
            </Button>
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
          filters.status || filters.startDate || filters.endDate,
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
