import DataTable from "@/components/organisms/DataTable";
import ListFiltersPanel from "@/components/molecules/ListFiltersPanel";
import ListPager from "@/components/molecules/ListPager";
import ManagementPanelTemplate from "@/components/templates/management/ManagementPanelTemplate";
import {
  useEventsContext,
  eventUiCopy,
  ALL_EVENT_STATUSES,
  EVENT_STATUS_LABELS,
} from "@/features/events";
import type { EventStatus } from "@/api/events/schema";

type EventsHeaderTab = EventStatus | "" | "__upcoming__";

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

  const tabs: { value: EventsHeaderTab; label: string }[] = [
    { value: "", label: "Todos" },
    { value: "__upcoming__", label: "Próximos" },
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
      <ListFiltersPanel
        searchValue={search}
        searchPlaceholder={eventUiCopy.list.searchPlaceholder}
        onSearchChange={setSearch}
        statusValue={activeStatusTab}
        statusOptions={tabs}
        onStatusChange={(value) =>
          setActiveStatusTab(value as EventStatus | "" | "__upcoming__")
        }
        onClear={() => {
          setSearch("");
          setActiveStatusTab("");
        }}
        hasActiveFilters={Boolean(search || activeStatusTab)}
      />

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
