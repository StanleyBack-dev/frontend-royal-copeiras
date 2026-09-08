import { useCallback, useEffect, useMemo, useState } from "react";
import {
  generatePublicIntakeCode,
  getPublicIntakeCodes,
} from "@/api/public-intake/methods";
import type {
  GeneratedPublicIntakeCode,
  PublicIntakeCodeListItem,
} from "@/api/public-intake/schema";
import { getHttpErrorMessage } from "@/api/shared/http-error";
import { useToast } from "@/shared/toast/useToast";
import { getPublicIntakeCodeTableColumns } from "../model/listing";
import { publicIntakeUiCopy } from "../model/messages";

const DEFAULT_LIMIT = 10;

export function usePublicIntakeCodes() {
  const [items, setItems] = useState<PublicIntakeCodeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    limit: DEFAULT_LIMIT,
    totalPages: 0,
    hasNextPage: false,
  });
  const { showError, showSuccess } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPublicIntakeCodes({
        page: pagination.currentPage,
        limit: pagination.limit,
      });

      setItems(response.items);
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
        publicIntakeUiCopy.errors.loadFallback,
      );
      showError(publicIntakeUiCopy.errors.loadFallback, message);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, showError]);

  useEffect(() => {
    void load();
  }, [load]);

  const setLimit = useCallback((limit: number) => {
    setPagination((previous) => ({
      ...previous,
      currentPage: 1,
      limit: Math.max(1, limit),
    }));
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

  const generateCode =
    useCallback(async (): Promise<GeneratedPublicIntakeCode | null> => {
      setGenerating(true);
      try {
        const issued = await generatePublicIntakeCode();
        showSuccess(publicIntakeUiCopy.success.generated);
        await load();
        return issued;
      } catch (error) {
        const message = getHttpErrorMessage(
          error,
          publicIntakeUiCopy.errors.generateFallback,
        );
        showError(publicIntakeUiCopy.errors.generateFallback, message);
        return null;
      } finally {
        setGenerating(false);
      }
    }, [load, showError, showSuccess]);

  const columns = useMemo(() => getPublicIntakeCodeTableColumns(), []);

  return {
    items,
    loading,
    generating,
    columns,
    pagination,
    setLimit,
    nextPage,
    prevPage,
    generateCode,
    load,
  };
}
