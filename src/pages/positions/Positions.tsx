import DataTable from "@/components/organisms/DataTable";
import FilterBar from "@/components/molecules/FilterBar";
import ListFiltersPanel from "@/components/molecules/ListFiltersPanel";
import ListPager from "@/components/molecules/ListPager";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PositionHistoryTemplate from "@/components/templates/positions/PositionHistoryTemplate";
import { positionRoutePaths } from "@/router";
import { positionUiCopy, usePositionsList } from "@/features/positions";
import { usePositionsContext } from "@/features/positions/context/usePositionsContext";

export default function Positions() {
  const { positions, loading, pagination, setLimit, nextPage, prevPage } =
    usePositionsContext();
  const navigate = useNavigate();
  const { search, setSearch, filteredPositions, columns } = usePositionsList({
    positions,
  });

  return (
    <PositionHistoryTemplate>
      <FilterBar
        action={{
          label: positionUiCopy.listing.newAction,
          onClick: () => navigate(positionRoutePaths.create),
          leftIcon: <Plus size={16} />,
        }}
      />
      <ListFiltersPanel
        searchValue={search}
        searchPlaceholder={positionUiCopy.listing.searchPlaceholder}
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
            data={filteredPositions}
            columns={columns}
            emptyMessage={positionUiCopy.listing.emptyMessage}
            getId={(position) => position.idPositions}
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
    </PositionHistoryTemplate>
  );
}
