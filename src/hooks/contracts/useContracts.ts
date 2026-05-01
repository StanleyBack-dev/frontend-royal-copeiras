import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Budget } from "../../api/budgets/schema";
import type { Lead } from "../../api/leads/schema";
import type {
  Contract,
  CreateContractPayload,
} from "../../api/contracts/schema";
import type { PaginationMeta } from "../../api/shared/contracts";
import { getHttpErrorMessage } from "../../api/shared/http-error";
import { fetchBudgetLeadOptions } from "../../features/budgets/services/budget.service";
import {
  fetchApprovedBudgets,
  fetchContracts,
  saveContract,
  type ContractListQueryParams,
} from "../../features/contracts/services/contract.service";
import { contractUiCopy } from "../../features/contracts/model/messages";
import { useToast } from "../../shared/toast/useToast";

interface ContractFilters {
  status: string;
  startDate: string;
  endDate: string;
  idBudgets: string;
}

export interface UseContractsResult {
  contracts: Contract[];
  budgets: Budget[];
  leads: Lead[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  pagination: PaginationMeta;
  filters: ContractFilters;
  load: (params?: ContractListQueryParams) => Promise<void>;
  setPage: (page: number) => Promise<void>;
  setLimit: (limit: number) => Promise<void>;
  setFilters: (filters: Partial<ContractFilters>) => Promise<void>;
  clearFilters: () => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  save: (
    formData: CreateContractPayload,
    editing?: Contract | null,
  ) => Promise<Contract | null>;
  setContracts: React.Dispatch<React.SetStateAction<Contract[]>>;
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

function readFilters(searchParams: URLSearchParams): ContractFilters {
  return {
    status: searchParams.get("status") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    idBudgets: searchParams.get("idBudgets") || "",
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

export function useContracts(): UseContractsResult {
  const [searchParams, setSearchParams] = useSearchParams();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
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

  const loadApprovedBudgets = useCallback(async () => {
    try {
      const result = await fetchApprovedBudgets();
      setBudgets(result);
    } catch (err) {
      const message = getHttpErrorMessage(
        err,
        contractUiCopy.errors.loadBudgetsFallback,
      );
      showError(contractUiCopy.errors.loadBudgetsFallback, message);
    }
  }, [showError]);

  const loadLeads = useCallback(async () => {
    try {
      const result = await fetchBudgetLeadOptions();
      setLeads(result);
    } catch (err) {
      const message = getHttpErrorMessage(
        err,
        contractUiCopy.errors.loadBudgetsFallback,
      );
      showError(contractUiCopy.errors.loadBudgetsFallback, message);
    }
  }, [showError]);

  const load = useCallback(
    async (params: ContractListQueryParams = {}) => {
      setLoading(true);
      setError(null);

      const requestedPage = params.page ?? paginationRef.current.currentPage;
      const requestedLimit = params.limit ?? paginationRef.current.limit;

      try {
        const data = await fetchContracts({
          page: requestedPage,
          limit: requestedLimit,
          status: params.status,
          startDate: params.startDate,
          endDate: params.endDate,
          idBudgets: params.idBudgets,
        });
        setContracts(data.items);
        setPagination(data.pagination);
      } catch (err) {
        const message = getHttpErrorMessage(
          err,
          contractUiCopy.errors.loadContractsFallback,
        );
        setError(message);
        showError(contractUiCopy.errors.loadContractsFallback, message);
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
    void loadApprovedBudgets();
  }, [loadApprovedBudgets]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

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

    void fetchContracts({
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
    async (nextFilters: Partial<ContractFilters>) => {
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
        return next;
      });
    },
    [currentLimit, setSearchParams],
  );

  const clearFilters = useCallback(async () => {
    await setFilters({ status: "", startDate: "", endDate: "", idBudgets: "" });
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
    async (formData: CreateContractPayload, editing?: Contract | null) => {
      setSaving(true);
      setError(null);

      try {
        const savedContract = await saveContract({ formData, editing });
        showSuccess(
          editing
            ? contractUiCopy.success.updateContract
            : contractUiCopy.success.createContract,
        );
        await load({
          page: pagination.currentPage,
          limit: pagination.limit,
          ...filters,
        });
        return savedContract;
      } catch (err) {
        const message = getHttpErrorMessage(
          err,
          contractUiCopy.errors.saveContractFallback,
        );
        setError(message);
        showError(contractUiCopy.errors.saveContractFallback, message);
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
    contracts,
    budgets,
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
    setContracts,
  };
}
