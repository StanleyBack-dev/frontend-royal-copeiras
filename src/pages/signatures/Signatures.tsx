import { useMemo } from "react";
import ListFiltersPanel from "@/components/molecules/ListFiltersPanel";
import ListPager from "@/components/molecules/ListPager";
import ManagementPanelTemplate from "@/components/templates/management/ManagementPanelTemplate";
import {
  useSignaturesContext,
  signatureUiCopy,
  getSignatureStatusLabel,
  groupSignaturesByContract,
} from "@/features/signatures";
import SignatureGroupList from "@/features/signatures/components/SignatureGroupList";

export default function Signatures() {
  const {
    items,
    loading,
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
  } = useSignaturesContext();

  const groups = useMemo(() => groupSignaturesByContract(items), [items]);

  return (
    <ManagementPanelTemplate
      title={signatureUiCopy.list.title}
      description={signatureUiCopy.list.description}
    >
      <ListFiltersPanel
        searchValue={search}
        searchPlaceholder={signatureUiCopy.list.searchPlaceholder}
        onSearchChange={setSearch}
        statusValue={filters.status}
        statusOptions={[
          { value: "", label: signatureUiCopy.filters.allStatuses },
          ...statusOptions.map((status) => ({
            value: status,
            label: getSignatureStatusLabel(status),
          })),
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
        onClear={() => {
          setSearch("");
          clearFilters();
        }}
        hasActiveFilters={Boolean(
          search ||
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
          <SignatureGroupList
            groups={groups}
            emptyMessage={signatureUiCopy.list.emptyMessage}
          />
          <ListPager
            pagination={pagination}
            loading={loading}
            onLimitChange={(limit) => setLimit(limit)}
            onPrev={() => prevPage()}
            onNext={() => nextPage()}
          />
        </>
      )}
    </ManagementPanelTemplate>
  );
}
