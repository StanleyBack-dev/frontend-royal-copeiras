import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { Supply } from "../../../api/supplies/schema";
import {
  filterSuppliesBySearch,
  getSupplyTableColumns,
} from "../model/listing";

interface UseSuppliesListParams {
  supplies: Supply[];
}

export function useSuppliesList({ supplies }: UseSuppliesListParams) {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";

  const setSearch = useCallback(
    (value: string) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        if (value.trim()) {
          next.set("search", value);
        } else {
          next.delete("search");
        }

        return next;
      });
    },
    [setSearchParams],
  );

  const filteredSupplies = useMemo(
    () => filterSuppliesBySearch(supplies, search),
    [supplies, search],
  );

  const columns = useMemo(() => getSupplyTableColumns(), []);

  return {
    search,
    setSearch,
    filteredSupplies,
    columns,
  };
}
