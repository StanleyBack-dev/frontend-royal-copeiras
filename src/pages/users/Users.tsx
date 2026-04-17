import DataTable from "@/components/organisms/DataTable";
import FilterBar from "@/components/molecules/FilterBar";
import { Plus } from "lucide-react";
import SearchIcon from "@/components/atoms/icons/SearchIcon";
import { colors } from "@/config";
import { useNavigate } from "react-router-dom";
import UserHistoryTemplate from "@/components/templates/users/UserHistoryTemplate";
import { userUiCopy, useUsersList } from "@/features/users";
import { useUsersContext } from "@/features/users/context/useUsersContext";
import { userRoutePaths } from "@/router";

export default function Users() {
  const { users, loading, pagination, setLimit, nextPage, prevPage } =
    useUsersContext();
  const navigate = useNavigate();
  const { search, setSearch, filteredUsers, columns } = useUsersList({ users });

  return (
    <UserHistoryTemplate>
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={userUiCopy.listing.searchPlaceholder}
        searchIcon={<SearchIcon size={16} style={{ color: colors.brown[300] }} />}
        action={{
          label: userUiCopy.listing.newAction,
          onClick: () => navigate(userRoutePaths.create),
          leftIcon: <Plus size={16} />,
        }}
      />
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: "#C9A227", borderTopColor: "transparent" }}
          />
        </div>
      ) : (
        <>
          <DataTable
            data={filteredUsers}
            columns={columns}
            emptyMessage={userUiCopy.listing.emptyMessage}
            getId={(user) => user.idUsers}
          />
          <div className="mt-4 flex items-center justify-between text-sm text-brown-700">
            <span>
              Pagina {pagination.currentPage} de {Math.max(pagination.totalPages, 1)}
              {" - "}
              {pagination.total} registros
            </span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2">
                <span>Itens:</span>
                <select
                  className="rounded border border-brown-300 bg-white px-2 py-1"
                  value={pagination.limit}
                  onChange={(event) => {
                    void setLimit(Number(event.target.value));
                  }}
                  disabled={loading}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </label>
              <button
                type="button"
                className="rounded border border-brown-300 px-3 py-1 disabled:opacity-50"
                onClick={() => {
                  void prevPage();
                }}
                disabled={loading || pagination.currentPage <= 1}
              >
                Anterior
              </button>
              <button
                type="button"
                className="rounded border border-brown-300 px-3 py-1 disabled:opacity-50"
                onClick={() => {
                  void nextPage();
                }}
                disabled={loading || !pagination.hasNextPage}
              >
                Proxima
              </button>
            </div>
          </div>
        </>
      )}
    </UserHistoryTemplate>
  );
}