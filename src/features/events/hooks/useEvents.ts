import { useCallback, useEffect, useMemo, useState } from "react";
import { EventSchema } from "../../../api/events/schema";
import { getEvents } from "../../../api/events/methods/get-list";
import { updateEventAssignment } from "../../../api/events/methods/update-assignment";
import { updateEvent } from "../../../api/events/methods/update-event";
import { getHttpErrorMessage } from "../../../api/shared/http-error";
import { useToast } from "../../../shared/toast/useToast";
import {
  filterEventsBySearch,
  getEventTableColumns,
  sortEventsByNearestDate,
  type EventItem,
} from "../model/listing";
import { eventUiCopy } from "../model/messages";
import type { EventStatus } from "../../../api/events/schema";
import { useNavigate } from "react-router-dom";
import { eventRoutePaths } from "../../../router/navigation/paths";

interface EventFilters {
  status: string;
  startDate: string;
  endDate: string;
}

type EventsHeaderTab = EventStatus | "" | "__upcoming__";

const DEFAULT_LIMIT = 10;

function parseEventDateToTimestamp(dateValue: string): number {
  const trimmedValue = dateValue.trim();
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmedValue);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const monthIndex = Number(isoMatch[2]) - 1;
    const day = Number(isoMatch[3]);
    return new Date(year, monthIndex, day, 12, 0, 0, 0).getTime();
  }

  const brMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmedValue);
  if (brMatch) {
    const day = Number(brMatch[1]);
    const monthIndex = Number(brMatch[2]) - 1;
    const year = Number(brMatch[3]);
    return new Date(year, monthIndex, day, 12, 0, 0, 0).getTime();
  }

  return Date.parse(trimmedValue);
}

export function useEvents() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [updatingEventStatusIds, setUpdatingEventStatusIds] = useState<
    Set<string>
  >(new Set());
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeStatusTab, setActiveStatusTab] = useState<EventsHeaderTab>("");
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    limit: DEFAULT_LIMIT,
    totalPages: 0,
    hasNextPage: false,
  });
  const [filters, setFiltersState] = useState<EventFilters>({
    status: "",
    startDate: "",
    endDate: "",
  });
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getEvents({
        page: pagination.currentPage,
        limit: pagination.limit,
        status:
          activeStatusTab && activeStatusTab !== "__upcoming__"
            ? activeStatusTab
            : filters.status || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });

      const parsed = EventSchema.array().safeParse(response.items);
      if (!parsed.success) {
        throw new Error("Dados de eventos inválidos");
      }

      setItems(sortEventsByNearestDate(parsed.data));
      setPagination({
        total: response.total,
        currentPage: response.currentPage,
        limit: response.limit,
        totalPages: response.totalPages,
        hasNextPage: response.hasNextPage,
      });
    } catch (error) {
      const message = getHttpErrorMessage(
        error,
        eventUiCopy.errors.loadFallback,
      );
      showError(eventUiCopy.errors.loadFallback, message);
    } finally {
      setLoading(false);
    }
  }, [
    activeStatusTab,
    filters.status,
    filters.startDate,
    filters.endDate,
    pagination.currentPage,
    pagination.limit,
    showError,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredItems = useMemo(() => {
    const searchedItems = filterEventsBySearch(items, search);

    if (activeStatusTab !== "__upcoming__") {
      return searchedItems;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const upcomingItems = searchedItems.filter((item) => {
      const parsedEventDates = (item.eventDates ?? [])
        .map(parseEventDateToTimestamp)
        .filter((value) => Number.isFinite(value));

      if (parsedEventDates.length === 0) {
        return false;
      }

      return parsedEventDates.some((eventDateTimestamp) => {
        return eventDateTimestamp >= todayTimestamp;
      });
    });

    return [...upcomingItems].sort((left, right) => {
      const leftFutureDates = (left.eventDates ?? [])
        .map(parseEventDateToTimestamp)
        .filter((value) => Number.isFinite(value) && value >= todayTimestamp);
      const rightFutureDates = (right.eventDates ?? [])
        .map(parseEventDateToTimestamp)
        .filter((value) => Number.isFinite(value) && value >= todayTimestamp);

      const leftNextDate = leftFutureDates.length
        ? Math.min(...leftFutureDates)
        : Number.POSITIVE_INFINITY;
      const rightNextDate = rightFutureDates.length
        ? Math.min(...rightFutureDates)
        : Number.POSITIVE_INFINITY;

      if (leftNextDate !== rightNextDate) {
        return leftNextDate - rightNextDate;
      }

      return Date.parse(right.createdAt) - Date.parse(left.createdAt);
    });
  }, [items, search, activeStatusTab]);

  const columns = useMemo(
    () =>
      getEventTableColumns(
        (item) => {
          navigate(eventRoutePaths.detail(item.idEvents));
        },
        (item, status) => {
          void handleUpdateEventStatus(item, status);
        },
        updatingEventStatusIds,
      ),
    [navigate, updatingEventStatusIds, handleUpdateEventStatus],
  );

  function setFilters(partial: Partial<EventFilters>) {
    setFiltersState((prev) => ({ ...prev, ...partial }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }

  function clearFilters() {
    setFiltersState({ status: "", startDate: "", endDate: "" });
    setActiveStatusTab("");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }

  function nextPage() {
    if (pagination.hasNextPage) {
      setPagination((prev) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
      }));
    }
  }

  function prevPage() {
    if (pagination.currentPage > 1) {
      setPagination((prev) => ({
        ...prev,
        currentPage: prev.currentPage - 1,
      }));
    }
  }

  function setLimit(limit: number) {
    setPagination((prev) => ({ ...prev, limit, currentPage: 1 }));
  }

  function handleStatusTabChange(status: EventsHeaderTab) {
    setActiveStatusTab(status);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }

  async function handleUpdateAssignment(
    idEventAssignments: string,
    payload: { idEmployees: string; employeePayment: number },
  ) {
    return handleUpdateAssignments([
      {
        idEventAssignments,
        payload,
      },
    ]);
  }

  async function handleUpdateAssignments(
    updates: Array<{
      idEventAssignments: string;
      payload: { idEmployees: string; employeePayment: number };
    }>,
  ) {
    if (!updates.length) {
      return;
    }

    try {
      await Promise.all(
        updates.map((update) =>
          updateEventAssignment(update.idEventAssignments, update.payload),
        ),
      );
      showSuccess(
        eventUiCopy.success.assignmentUpdated,
        eventUiCopy.success.assignmentUpdated,
      );
      await load();
    } catch (error) {
      const message = getHttpErrorMessage(
        error,
        eventUiCopy.errors.updateFallback,
      );
      showError(eventUiCopy.errors.updateFallback, message);
      throw error;
    }
  }

  async function handleUpdateEvent(
    idEvents: string,
    payload: { overtimeMinutes?: number; status?: EventStatus },
  ) {
    try {
      await updateEvent(idEvents, payload);
      showSuccess(
        eventUiCopy.success.eventUpdated,
        eventUiCopy.success.eventUpdated,
      );
      await load();
    } catch (error) {
      const message = getHttpErrorMessage(
        error,
        eventUiCopy.errors.updateFallback,
      );
      showError(eventUiCopy.errors.updateFallback, message);
      throw error;
    }
  }

  async function handleUpdateEventStatus(item: EventItem, status: EventStatus) {
    const currentStatus = item.status;
    if (currentStatus === status) {
      return;
    }

    setUpdatingEventStatusIds((prev) => {
      const next = new Set(prev);
      next.add(item.idEvents);
      return next;
    });

    setItems((prev) =>
      prev.map((eventItem) =>
        eventItem.idEvents === item.idEvents
          ? { ...eventItem, status }
          : eventItem,
      ),
    );

    try {
      await handleUpdateEvent(item.idEvents, { status });
    } catch {
      setItems((prev) =>
        prev.map((eventItem) =>
          eventItem.idEvents === item.idEvents
            ? { ...eventItem, status: currentStatus }
            : eventItem,
        ),
      );
    } finally {
      setUpdatingEventStatusIds((prev) => {
        const next = new Set(prev);
        next.delete(item.idEvents);
        return next;
      });
    }
  }

  return {
    items: filteredItems,
    allItems: items,
    loading,
    search,
    setSearch,
    filters,
    setFilters,
    clearFilters,
    pagination,
    nextPage,
    prevPage,
    setLimit,
    columns,
    activeStatusTab,
    setActiveStatusTab: handleStatusTabChange,
    handleUpdateEvent,
    handleUpdateAssignment,
    handleUpdateAssignments,
    reload: load,
  };
}
