import DataTable from "@/components/organisms/DataTable";
import FilterBar from "@/components/molecules/FilterBar";
import ListFiltersPanel from "@/components/molecules/ListFiltersPanel";
import ListPager from "@/components/molecules/ListPager";
import { Plus } from "lucide-react";
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
        action={{
          label: userUiCopy.listing.newAction,
          onClick: () => navigate(userRoutePaths.create),
          leftIcon: <Plus size={16} />,
        }}
      />
      <ListFiltersPanel
        searchValue={search}
        searchPlaceholder={userUiCopy.listing.searchPlaceholder}
        onSearchChange={setSearch}
        onClear={() => setSearch("")}
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
          <ListPager
            pagination={pagination}
            loading={loading}
            onLimitChange={(limit) => void setLimit(limit)}
            onPrev={() => void prevPage()}
            onNext={() => void nextPage()}
          />
        </>
      )}
    </UserHistoryTemplate>
  );
}
