import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { Position } from "../../../api/positions/schema";
import {
  filterPositionsBySearch,
  getPositionTableColumns,
} from "../model/listing";

interface UsePositionsListParams {
  positions: Position[];
}

export function usePositionsList({ positions }: UsePositionsListParams) {
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

  const filteredPositions = useMemo(
    () => filterPositionsBySearch(positions, search),
    [positions, search],
  );

  const columns = useMemo(() => getPositionTableColumns(), []);

  return {
    search,
    setSearch,
    filteredPositions,
    columns,
  };
}
