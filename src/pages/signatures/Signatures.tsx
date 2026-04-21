import Button from "@/components/atoms/Button";
import FilterBar from "@/components/molecules/FilterBar";
import ListFiltersPanel from "@/components/molecules/ListFiltersPanel";
import DataTable from "@/components/organisms/DataTable";
import ManagementPanelTemplate from "@/components/templates/management/ManagementPanelTemplate";
import { useSignaturesContext, signatureUiCopy } from "@/features/signatures";
import SearchIcon from "@/components/atoms/icons/SearchIcon";
import { colors } from "@/config";
import { contractRoutePaths } from "@/router";
import { RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Select from "@/components/atoms/Select";

export default function Signatures() {
  const navigate = useNavigate();
  const {
    items,
    columns,
    loading,
    updatingRowId,
    search,
    setSearch,
    filters,
    pagination,
    setLimit,
    setFilters,
    clearFilters,
    nextPage,
    prevPage,
    statusOptions,
    providerOptions,
    refreshStatus,
    cancelRequest,
  } = useSignaturesContext();

  return (
    <ManagementPanelTemplate
      title={signatureUiCopy.list.title}
      description={signatureUiCopy.list.description}
    >
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={signatureUiCopy.list.searchPlaceholder}
        searchIcon={
          <SearchIcon size={16} style={{ color: colors.brown[300] }} />
        }
      />

      <ListFiltersPanel
        statusValue={filters.status}
        statusOptions={[
          { value: "", label: signatureUiCopy.filters.allStatuses },
          ...statusOptions.map((status) => ({ value: status, label: status })),
        ]}
        onStatusChange={(value) => {
          setFilters({ status: value });
        }}
        startDateValue={filters.startDate}
        endDateValue={filters.endDate}
        onStartDateChange={(value) => {
          setFilters({ startDate: value });
        }}
        onEndDateChange={(value) => {
          setFilters({ endDate: value });
        }}
        extraFilters={
          <div className="min-w-[240px]">
            <Select
              value={filters.provider}
              onChange={(event) => {
                setFilters({ provider: event.target.value });
              }}
            >
              <option value="">{signatureUiCopy.filters.allProviders}</option>
              {providerOptions.map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </Select>
          </div>
        }
        onClear={() => {
          clearFilters();
        }}
        hasActiveFilters={Boolean(
          filters.status ||
          filters.startDate ||
          filters.endDate ||
          filters.provider,
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
            data={items}
            columns={[
              ...columns,
              {
                key: "quickActions",
                label: "Ações rápidas",
                render: (item) => (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      leftIcon={<RotateCcw size={14} />}
                      onClick={() => {
                        void refreshStatus(item);
                      }}
                      disabled={updatingRowId === item.idContracts}
                    >
                      Atualizar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        void cancelRequest(item);
                      }}
                      disabled={updatingRowId === item.idContracts}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() =>
                        navigate(contractRoutePaths.edit(item.idContracts))
                      }
                    >
                      Contrato
                    </Button>
                  </div>
                ),
              },
            ]}
            emptyMessage={signatureUiCopy.list.emptyMessage}
            getId={(item) => item.idContracts}
          />
          <div className="mt-4 flex items-center justify-between text-sm text-brown-700">
            <span>
              Página {pagination.currentPage} de{" "}
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
                    setLimit(Number(event.target.value));
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
                  prevPage();
                }}
                disabled={loading || pagination.currentPage <= 1}
              >
                Anterior
              </button>
              <button
                type="button"
                className="rounded border border-brown-300 px-3 py-1 disabled:opacity-50"
                onClick={() => {
                  nextPage();
                }}
                disabled={loading || !pagination.hasNextPage}
              >
                Próxima
              </button>
            </div>
          </div>
        </>
      )}
    </ManagementPanelTemplate>
  );
}
