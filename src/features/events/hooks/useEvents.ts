import { useCallback, useEffect, useMemo, useState } from "react";
import { EventSchema } from "../../../api/events/schema";
import { getEvents } from "../../../api/events/methods/get-list";
import { updateEventAssignment } from "../../../api/events/methods/update-assignment";
import { getHttpErrorMessage } from "../../../api/shared/http-error";
import { useToast } from "../../../shared/toast/useToast";
import {
  filterEventsBySearch,
  getEventTableColumns,
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

const DEFAULT_LIMIT = 10;

export function useEvents() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeStatusTab, setActiveStatusTab] = useState<EventStatus | "">("");
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
        status: activeStatusTab || filters.status || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });

      const parsed = EventSchema.array().safeParse(response.items);
      if (!parsed.success) {
        throw new Error("Dados de eventos inválidos");
      }

      setItems(parsed.data);
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

  const filteredItems = useMemo(
    () => filterEventsBySearch(items, search),
    [items, search],
  );

  const columns = useMemo(
    () =>
      getEventTableColumns((item) => {
        navigate(eventRoutePaths.detail(item.idEvents));
      }),
    [navigate],
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

  function handleStatusTabChange(status: EventStatus | "") {
    setActiveStatusTab(status);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }

  async function handleUpdateAssignment(
    idEventAssignments: string,
    payload: { idEmployees?: string; employeePayment?: number },
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
      payload: { idEmployees?: string; employeePayment?: number };
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
    handleUpdateAssignment,
    handleUpdateAssignments,
    reload: load,
  };
}
