import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { CreateLeadPayload, Lead } from "../../api/leads/schema";
import type { PaginationMeta } from "../../api/shared/contracts";
import { getHttpErrorMessage } from "../../api/shared/http-error";
import {
  fetchLeads,
  saveLead,
  type LeadListQueryParams,
} from "../../features/leads/services/lead.service";
import { leadUiCopy } from "../../features/leads/model/messages";
import { useToast } from "../../shared/toast/useToast";

interface LeadFilters {
  status: string;
  startDate: string;
  endDate: string;
}

export interface UseLeadsResult {
  leads: Lead[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  pagination: PaginationMeta;
  filters: LeadFilters;
  load: (params?: LeadListQueryParams) => Promise<void>;
  setPage: (page: number) => Promise<void>;
  setLimit: (limit: number) => Promise<void>;
  setFilters: (filters: Partial<LeadFilters>) => Promise<void>;
  clearFilters: () => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  save: (formData: CreateLeadPayload, editing?: Lead | null) => Promise<void>;
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

const DEFAULT_LIMIT = 10;

const EMPTY_PAGINATION: PaginationMeta = {
  total: 0,
  currentPage: 1,
  limit: DEFAULT_LIMIT,
  totalPages: 0,
  hasNextPage: false,
};

function toPositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function readFilters(searchParams: URLSearchParams): LeadFilters {
  return {
    status: searchParams.get("status") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
  };
}

function applyOptionalSearchParam(
  params: URLSearchParams,
  key: string,
  value?: string,
) {
  if (value) {
    params.set(key, value);
    return;
  }

  params.delete(key);
}

export function useLeads(): UseLeadsResult {
  const [searchParams, setSearchParams] = useSearchParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] =
    useState<PaginationMeta>(EMPTY_PAGINATION);
  const paginationRef = useRef<PaginationMeta>(EMPTY_PAGINATION);
  const prefetchInFlightRef = useRef<Set<string>>(new Set());
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  const load = useCallback(
    async (params: LeadListQueryParams = {}) => {
      setLoading(true);
      setError(null);

      const requestedPage = params.page ?? paginationRef.current.currentPage;
      const requestedLimit = params.limit ?? paginationRef.current.limit;

      try {
        const data = await fetchLeads({
          page: requestedPage,
          limit: requestedLimit,
          status: params.status,
          startDate: params.startDate,
          endDate: params.endDate,
        });
        setLeads(data.items);
        setPagination(data.pagination);
      } catch (err) {
        const message = getHttpErrorMessage(
          err,
          leadUiCopy.errors.loadLeadsFallback,
        );
        setError(message);
        showError(leadUiCopy.errors.loadLeadsFallback, message);
      } finally {
        setLoading(false);
      }
    },
    [showError],
  );

  const currentPage = toPositiveInt(searchParams.get("page"), 1);
  const currentLimit = toPositiveInt(searchParams.get("limit"), DEFAULT_LIMIT);
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);

  useEffect(() => {
    void load({
      page: currentPage,
      limit: currentLimit,
      ...filters,
    });
  }, [currentPage, currentLimit, filters, load]);

  useEffect(() => {
    if (!pagination.hasNextPage) {
      return;
    }

    const nextPageNumber = pagination.currentPage + 1;
    const key = `${nextPageNumber}:${pagination.limit}`;

    if (prefetchInFlightRef.current.has(key)) {
      return;
    }

    const inFlightPrefetches = prefetchInFlightRef.current;
    inFlightPrefetches.add(key);
    let isActive = true;

    void fetchLeads({
      page: nextPageNumber,
      limit: pagination.limit,
      ...filters,
    })
      .catch(() => {
        // Best effort prefetch.
      })
      .finally(() => {
        if (isActive) {
          inFlightPrefetches.delete(key);
        }
      });

    return () => {
      isActive = false;
      inFlightPrefetches.delete(key);
    };
  }, [
    filters,
    pagination.currentPage,
    pagination.hasNextPage,
    pagination.limit,
  ]);

  useEffect(() => {
    const inFlightPrefetches = prefetchInFlightRef.current;
    return () => {
      inFlightPrefetches.clear();
    };
  }, []);

  const setPage = useCallback(
    async (page: number) => {
      const safePage = Math.max(1, page);
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        next.set("page", String(safePage));
        next.set("limit", String(currentLimit));
        return next;
      });
    },
    [currentLimit, setSearchParams],
  );

  const setLimit = useCallback(
    async (limit: number) => {
      const safeLimit = Math.max(1, limit);
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        next.set("page", "1");
        next.set("limit", String(safeLimit));
        return next;
      });
    },
    [setSearchParams],
  );

  const setFilters = useCallback(
    async (nextFilters: Partial<LeadFilters>) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        const merged = {
          ...readFilters(previous),
          ...nextFilters,
        };

        next.set("page", "1");
        next.set("limit", String(currentLimit));
        applyOptionalSearchParam(next, "status", merged.status);
        applyOptionalSearchParam(next, "startDate", merged.startDate);
        applyOptionalSearchParam(next, "endDate", merged.endDate);
        return next;
      });
    },
    [currentLimit, setSearchParams],
  );

  const clearFilters = useCallback(async () => {
    await setFilters({ status: "", startDate: "", endDate: "" });
  }, [setFilters]);

  const nextPage = useCallback(async () => {
    if (!pagination.hasNextPage) {
      return;
    }

    await setPage(pagination.currentPage + 1);
  }, [pagination.currentPage, pagination.hasNextPage, setPage]);

  const prevPage = useCallback(async () => {
    if (pagination.currentPage <= 1) {
      return;
    }

    await setPage(pagination.currentPage - 1);
  }, [pagination.currentPage, setPage]);

  const save = useCallback(
    async (formData: CreateLeadPayload, editing?: Lead | null) => {
      setSaving(true);
      setError(null);

      try {
        await saveLead({ formData, editing });
        showSuccess(
          editing
            ? leadUiCopy.success.updateLead
            : leadUiCopy.success.createLead,
        );
        await load({
          page: pagination.currentPage,
          limit: pagination.limit,
          ...filters,
        });
      } catch (err) {
        const message = getHttpErrorMessage(
          err,
          leadUiCopy.errors.saveLeadFallback,
        );
        setError(message);
        showError(leadUiCopy.errors.saveLeadFallback, message);
      } finally {
        setSaving(false);
      }
    },
    [
      filters,
      load,
      pagination.currentPage,
      pagination.limit,
      showError,
      showSuccess,
    ],
  );

  return {
    leads,
    loading,
    saving,
    error,
    pagination,
    filters,
    load,
    setPage,
    setLimit,
    setFilters,
    clearFilters,
    nextPage,
    prevPage,
    save,
    setLeads,
  };
}
