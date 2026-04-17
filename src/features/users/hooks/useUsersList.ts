import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { User } from "../../../api/users/schema";
import { filterUsersBySearch, getUserTableColumns } from "../model/listing";

interface UseUsersListParams {
  users: User[];
}

export function useUsersList({ users }: UseUsersListParams) {
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

  const filteredUsers = useMemo(
    () => filterUsersBySearch(users, search),
    [users, search],
  );

  const columns = useMemo(() => getUserTableColumns(), []);

  return {
    search,
    setSearch,
    filteredUsers,
    columns,
  };
}