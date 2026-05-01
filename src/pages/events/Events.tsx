import DataTable from "@/components/organisms/DataTable";
import FilterBar from "@/components/molecules/FilterBar";
import ManagementPanelTemplate from "@/components/templates/management/ManagementPanelTemplate";
import SearchIcon from "@/components/atoms/icons/SearchIcon";
import { colors } from "@/config";
import {
  useEventsContext,
  eventUiCopy,
  ALL_EVENT_STATUSES,
  EVENT_STATUS_LABELS,
} from "@/features/events";
import type { EventStatus } from "@/api/events/schema";

export default function Events() {
  const {
    items,
    columns,
    loading,
    search,
    setSearch,
    pagination,
    setLimit,
    nextPage,
    prevPage,
    activeStatusTab,
    setActiveStatusTab,
  } = useEventsContext();

  const tabs: { value: EventStatus | ""; label: string }[] = [
    { value: "", label: "Todos" },
    ...ALL_EVENT_STATUSES.map((status) => ({
      value: status,
      label: EVENT_STATUS_LABELS[status],
    })),
  ];

  return (
    <ManagementPanelTemplate
      title={eventUiCopy.list.title}
      description={eventUiCopy.list.description}
    >
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={eventUiCopy.list.searchPlaceholder}
        searchIcon={
          <SearchIcon size={16} style={{ color: colors.brown[300] }} />
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = activeStatusTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveStatusTab(tab.value as EventStatus | "")}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-[#7a4430] bg-[#7a4430] text-white"
                  : "border-[#e8d5c9] bg-[#faf6f2] text-[#7a4430] hover:border-[#7a4430]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2"
            style={{ borderColor: "#7a4430", borderTopColor: "transparent" }}
          />
        </div>
      ) : (
        <>
          <DataTable
            data={items}
            columns={columns}
            emptyMessage={eventUiCopy.list.emptyMessage}
            getId={(item) => item.idEvents}
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
