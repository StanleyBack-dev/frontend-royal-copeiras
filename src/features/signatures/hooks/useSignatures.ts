import { useCallback, useEffect, useMemo, useState } from "react";
import { updateContract } from "../../../api/contracts/methods";
import type { Contract } from "../../../api/contracts/schema";
import { SignatureListItemSchema } from "../../../api/signature/schema";
import {
  cancelSignatureRequest,
  getSignatureStatus,
  getSignatures,
} from "../../../api/signature/methods";
import { getHttpErrorMessage } from "../../../api/shared/http-error";
import { useToast } from "../../../shared/toast/useToast";
import {
  filterSignaturesBySearch,
  getSignatureTableColumns,
  type SignatureItem,
} from "../model/listing";
import { signatureUiCopy } from "../model/messages";

interface SignatureFilters {
  status: string;
  startDate: string;
  endDate: string;
  provider: string;
}

const DEFAULT_LIMIT = 10;

function mapSignatureStatusToContractStatus(
  signatureStatus: string,
): Contract["status"] {
  const normalized = signatureStatus.trim().toLowerCase();
  switch (normalized) {
    case "signed":
      return "signed";
    case "rejected":
      return "rejected";
    case "cancelled":
    case "canceled":
      return "canceled";
    case "expired":
      return "expired";
    default:
      return "pending_signature";
  }
}

export function useSignatures(userId: string) {
  const [items, setItems] = useState<SignatureItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingRowId, setUpdatingRowId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    limit: DEFAULT_LIMIT,
    totalPages: 0,
    hasNextPage: false,
  });
  const [filters, setFiltersState] = useState<SignatureFilters>({
    status: "",
    startDate: "",
    endDate: "",
    provider: "",
  });
  const { showError, showSuccess } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSignatures({
        page: pagination.currentPage,
        limit: pagination.limit,
        status: filters.status || undefined,
      });
      const parsed = SignatureListItemSchema.array().safeParse(response.items);
      if (!parsed.success) {
        throw new Error("Dados de assinatura invalidos");
      }

      const mapped: SignatureItem[] = parsed.data.map((entry) => ({
        idContracts: entry.idContracts,
        contractNumber: entry.contractNumber || "-",
        contractStatus: (entry.contractStatus?.toLowerCase() ||
          "pending_signature") as Contract["status"],
        signatureProvider: entry.provider,
        signatureEnvelopeId: entry.envelopeId,
        signatureStatus: entry.status.toLowerCase(),
        signedByName: entry.signedByName ?? undefined,
        signedByEmail: entry.signedByEmail ?? undefined,
        signedByDocument: entry.signedByDocument ?? undefined,
        signatureUrl: entry.signatureUrl ?? undefined,
        signedAt: entry.signedAt ?? undefined,
        updatedAt: entry.updatedAt,
      }));

      setItems(mapped);
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
        signatureUiCopy.errors.loadFallback,
      );
      showError(signatureUiCopy.errors.loadFallback, message);
    } finally {
      setLoading(false);
    }
  }, [
    filters.status,
    pagination.currentPage,
    pagination.limit,
    showError,
    userId,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredItems = useMemo(() => {
    const searched = filterSignaturesBySearch(items, search);
    return searched.filter((item) => {
      const byStatus = filters.status
        ? (item.signatureStatus || "").toLowerCase() ===
          filters.status.toLowerCase()
        : true;
      const byProvider = filters.provider
        ? (item.signatureProvider || "").toLowerCase() ===
          filters.provider.toLowerCase()
        : true;
      const bySigner = true;
      const bySignerDocument = true;
      const eventDateRaw = item.signedAt || item.updatedAt;
      const byStartDate = filters.startDate
        ? eventDateRaw.slice(0, 10) >= filters.startDate
        : true;
      const byEndDate = filters.endDate
        ? eventDateRaw.slice(0, 10) <= filters.endDate
        : true;
      return (
        byStatus &&
        byProvider &&
        byStartDate &&
        byEndDate &&
        bySigner &&
        bySignerDocument
      );
    });
  }, [
    filters.endDate,
    filters.provider,

    filters.startDate,
    filters.status,
    items,
    search,
  ]);

  const columns = useMemo(() => getSignatureTableColumns(), []);

  const statusOptions = useMemo(() => {
    const unique = new Set<string>();
    for (const item of items) {
      if (item.signatureStatus) unique.add(item.signatureStatus.toLowerCase());
    }
    return Array.from(unique).sort();
  }, [items]);

  const providerOptions = useMemo(() => {
    const unique = new Set<string>();
    for (const item of items) {
      if (item.signatureProvider)
        unique.add(item.signatureProvider.toLowerCase());
    }
    return Array.from(unique).sort();
  }, [items]);

  const setLimit = useCallback((limit: number) => {
    setPagination((previous) => ({
      ...previous,
      currentPage: 1,
      limit: Math.max(1, limit),
    }));
  }, []);

  const setFilters = useCallback((nextFilters: Partial<SignatureFilters>) => {
    setFiltersState((previous) => ({ ...previous, ...nextFilters }));
    setPagination((previous) => ({ ...previous, currentPage: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({
      status: "",
      startDate: "",
      endDate: "",
      provider: "",
    });
    setPagination((previous) => ({ ...previous, currentPage: 1 }));
  }, []);

  const nextPage = useCallback(() => {
    setPagination((previous) =>
      previous.hasNextPage
        ? { ...previous, currentPage: previous.currentPage + 1 }
        : previous,
    );
  }, []);

  const prevPage = useCallback(() => {
    setPagination((previous) =>
      previous.currentPage > 1
        ? { ...previous, currentPage: previous.currentPage - 1 }
        : previous,
    );
  }, []);

  const refreshStatus = useCallback(
    async (item: SignatureItem) => {
      if (!item.signatureEnvelopeId) return;

      setUpdatingRowId(item.idContracts);
      try {
        const snapshot = await getSignatureStatus(item.signatureEnvelopeId);
        const nextStatus = snapshot.status.trim().toLowerCase();
        const nextContractStatus =
          mapSignatureStatusToContractStatus(nextStatus);

        await updateContract(item.idContracts, { status: nextContractStatus });

        setItems((previous) =>
          previous.map((entry) =>
            entry.idContracts === item.idContracts
              ? {
                  ...entry,
                  signatureStatus: nextStatus,
                  contractStatus: nextContractStatus,
                  signedAt: snapshot.completedAt || entry.signedAt,
                }
              : entry,
          ),
        );
        showSuccess(signatureUiCopy.success.refreshed);
      } catch (error) {
        const message = getHttpErrorMessage(
          error,
          signatureUiCopy.errors.updateFallback,
        );
        showError(signatureUiCopy.errors.updateFallback, message);
      } finally {
        setUpdatingRowId(null);
      }
    },
    [showError, showSuccess, userId],
  );

  const cancelRequest = useCallback(
    async (item: SignatureItem) => {
      if (!item.signatureEnvelopeId) return;

      setUpdatingRowId(item.idContracts);
      try {
        await cancelSignatureRequest(item.signatureEnvelopeId);
        await updateContract(item.idContracts, { status: "canceled" });

        setItems((previous) =>
          previous.map((entry) =>
            entry.idContracts === item.idContracts
              ? {
                  ...entry,
                  signatureStatus: "cancelled",
                  contractStatus: "canceled",
                }
              : entry,
          ),
        );
        showSuccess(signatureUiCopy.success.cancelled);
      } catch (error) {
        const message = getHttpErrorMessage(
          error,
          signatureUiCopy.errors.updateFallback,
        );
        showError(signatureUiCopy.errors.updateFallback, message);
      } finally {
        setUpdatingRowId(null);
      }
    },
    [showError, showSuccess, userId],
  );

  return {
    items: filteredItems,
    loading,
    updatingRowId,
    columns,
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
    load,
    refreshStatus,
    cancelRequest,
  };
}
