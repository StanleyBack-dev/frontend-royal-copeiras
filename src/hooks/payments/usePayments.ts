import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Budget } from "@/api/budgets/schema";
import type { Contract } from "@/api/contracts/schema";
import { EventSchema, type Event } from "@/api/events/schema";
import { getEvents } from "@/api/events/methods";
import type {
  CreatePaymentPayload,
  Payment,
  UpdatePaymentPayload,
} from "@/api/payments/schema";
import type { PaginationMeta } from "@/api/shared/contracts";
import { getHttpErrorMessage } from "@/api/shared/http-error";
import { fetchBudgets } from "@/features/budgets/services/budget.service";
import { fetchContracts } from "@/features/contracts/services/contract.service";
import {
  fetchPayments,
  savePayment,
  type PaymentListQueryParams,
} from "@/features/payments/services/payment.service";
import { paymentUiCopy } from "@/features/payments/model/messages";
import { useToast } from "@/shared/toast/useToast";

interface PaymentFilters {
  status: string;
  startDate: string;
  endDate: string;
  idBudgets: string;
  idContracts: string;
}

export interface UsePaymentsResult {
  payments: Payment[];
  budgets: Budget[];
  contracts: Contract[];
  events: Event[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  pagination: PaginationMeta;
  filters: PaymentFilters;
  load: (params?: PaymentListQueryParams) => Promise<void>;
  setPage: (page: number) => Promise<void>;
  setLimit: (limit: number) => Promise<void>;
  setFilters: (filters: Partial<PaymentFilters>) => Promise<void>;
  clearFilters: () => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  save: (
    formData: CreatePaymentPayload | UpdatePaymentPayload,
    editing?: Payment | null,
  ) => Promise<Payment | null>;
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
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

function readFilters(searchParams: URLSearchParams): PaymentFilters {
  return {
    status: searchParams.get("status") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    idBudgets: searchParams.get("idBudgets") || "",
    idContracts: searchParams.get("idContracts") || "",
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

export function usePayments(): UsePaymentsResult {
  const [searchParams, setSearchParams] = useSearchParams();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
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

  const loadFilterOptions = useCallback(async () => {
    const [budgetResult, contractResult, eventResult] =
      await Promise.allSettled([
        fetchBudgets({ page: 1, limit: 100 }),
        fetchContracts({ page: 1, limit: 100 }),
        getEvents({ page: 1, limit: 100 }),
      ]);

    if (budgetResult.status === "fulfilled") {
      setBudgets(budgetResult.value.items);
    }

    if (contractResult.status === "fulfilled") {
      setContracts(contractResult.value.items);
    }

    if (eventResult.status === "fulfilled") {
      const parsedEvents = EventSchema.array().safeParse(
        eventResult.value.items,
      );

      if (parsedEvents.success) {
        setEvents(parsedEvents.data);
      } else {
        setEvents([]);
      }
    }

    const loadError = [budgetResult, contractResult, eventResult].find(
      (result) => result.status === "rejected",
    );

    if (loadError?.status === "rejected") {
      const message = getHttpErrorMessage(
        loadError.reason,
        paymentUiCopy.errors.loadCollectionFallback,
      );
      showError(paymentUiCopy.errors.loadCollectionFallback, message);
    }
  }, [showError]);

  const load = useCallback(
    async (params: PaymentListQueryParams = {}) => {
      setLoading(true);
      setError(null);

      const requestedPage = params.page ?? paginationRef.current.currentPage;
      const requestedLimit = params.limit ?? paginationRef.current.limit;

      try {
        const data = await fetchPayments({
          page: requestedPage,
          limit: requestedLimit,
          status: params.status,
          startDate: params.startDate,
          endDate: params.endDate,
          idBudgets: params.idBudgets,
          idContracts: params.idContracts,
        });
        setPayments(data.items);
        setPagination(data.pagination);
      } catch (err) {
        const message = getHttpErrorMessage(
          err,
          paymentUiCopy.errors.loadPaymentsFallback,
        );
        setError(message);
        showError(paymentUiCopy.errors.loadPaymentsFallback, message);
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
    void loadFilterOptions();
  }, [loadFilterOptions]);

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

    void fetchPayments({
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
    async (nextFilters: Partial<PaymentFilters>) => {
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
        applyOptionalSearchParam(next, "idBudgets", merged.idBudgets);
        applyOptionalSearchParam(next, "idContracts", merged.idContracts);
        next.delete("idEvents");
        return next;
      });
    },
    [currentLimit, setSearchParams],
  );

  const clearFilters = useCallback(async () => {
    await setFilters({
      status: "",
      startDate: "",
      endDate: "",
      idBudgets: "",
      idContracts: "",
    });
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
    async (
      formData: CreatePaymentPayload | UpdatePaymentPayload,
      editing?: Payment | null,
    ) => {
      setSaving(true);
      setError(null);

      try {
        const savedPayment = await savePayment({ formData, editing });
        showSuccess(
          editing
            ? paymentUiCopy.success.updatePayment
            : paymentUiCopy.success.createPayment,
        );
        await load({
          page: pagination.currentPage,
          limit: pagination.limit,
          ...filters,
        });
        return savedPayment;
      } catch (err) {
        const message = getHttpErrorMessage(
          err,
          paymentUiCopy.errors.savePaymentFallback,
        );
        setError(message);
        showError(paymentUiCopy.errors.savePaymentFallback, message);
        return null;
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
    payments,
    budgets,
    contracts,
    events,
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
    setPayments,
  };
}
