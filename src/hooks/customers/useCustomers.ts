import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ListQueryParams,
  PaginationMeta,
} from "../../api/shared/contracts";
import { useSearchParams } from "react-router-dom";
import {
  type Customer,
  type CreateCustomerPayload,
} from "../../api/customers/schema";
import {
  fetchCustomers,
  saveCustomer,
} from "../../features/customers/services/customer.service";
import { customerUiCopy } from "../../features/customers/model/messages";
import { useToast } from "../../shared/toast/useToast";

export interface UseCustomersResult {
  customers: Customer[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  pagination: PaginationMeta;
  load: (params?: ListQueryParams) => Promise<void>;
  setPage: (page: number) => Promise<void>;
  setLimit: (limit: number) => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  save: (
    formData: CreateCustomerPayload,
    editing?: Customer | null,
  ) => Promise<void>;
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const DEFAULT_LIMIT = 10;

const EMPTY_PAGINATION: PaginationMeta = {
  total: 0,
  currentPage: 1,
  limit: DEFAULT_LIMIT,
  totalPages: 0,
  hasNextPage: false,
};

function toPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export function useCustomers(userId: string): UseCustomersResult {
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
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
    async (params: ListQueryParams = {}) => {
      setLoading(true);
      setError(null);

      const requestedPage = params.page ?? paginationRef.current.currentPage;
      const requestedLimit = params.limit ?? paginationRef.current.limit;

      try {
        const data = await fetchCustomers(userId, {
          page: requestedPage,
          limit: requestedLimit,
        });
        setCustomers(data.items);
        setPagination(data.pagination);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : customerUiCopy.errors.loadCustomersFallback;
        setError(message);
        showError(customerUiCopy.errors.loadCustomersFallback, message);
      } finally {
        setLoading(false);
      }
    },
    [showError, userId],
  );

  const currentPage = toPositiveInt(searchParams.get("page"), 1);
  const currentLimit = toPositiveInt(searchParams.get("limit"), DEFAULT_LIMIT);

  useEffect(() => {
    void load({ page: currentPage, limit: currentLimit });
  }, [currentPage, currentLimit, load]);

  useEffect(() => {
    if (!pagination.hasNextPage) {
      return;
    }

    const nextPageNumber = pagination.currentPage + 1;
    const key = `${nextPageNumber}:${pagination.limit}`;

    if (prefetchInFlightRef.current.has(key)) {
      return;
    }

    prefetchInFlightRef.current.add(key);
    let isActive = true;

    void fetchCustomers(userId, {
      page: nextPageNumber,
      limit: pagination.limit,
    })
      .catch(() => {
        // Prefetch is best-effort and must not impact visible flow.
      })
      .finally(() => {
        if (isActive) {
          prefetchInFlightRef.current.delete(key);
        }
      });

    return () => {
      isActive = false;
      prefetchInFlightRef.current.delete(key);
    };
  }, [
    pagination.currentPage,
    pagination.hasNextPage,
    pagination.limit,
    userId,
  ]);

  useEffect(() => {
    return () => {
      prefetchInFlightRef.current.clear();
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
    async (formData: CreateCustomerPayload, editing?: Customer | null) => {
      setSaving(true);
      setError(null);
      try {
        await saveCustomer({ userId, formData, editing });
        showSuccess(
          editing
            ? customerUiCopy.success.updateCustomer
            : customerUiCopy.success.createCustomer,
        );
        await load({ page: pagination.currentPage, limit: pagination.limit });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : customerUiCopy.errors.saveCustomerFallback;
        setError(message);
        showError(customerUiCopy.errors.saveCustomerFallback, message);
      } finally {
        setSaving(false);
      }
    },
    [
      userId,
      load,
      showError,
      showSuccess,
      pagination.currentPage,
      pagination.limit,
    ],
  );

  return {
    customers,
    loading,
    saving,
    error,
    pagination,
    load,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    save,
    setCustomers,
  };
}
