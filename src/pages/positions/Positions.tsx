import DataTable from "@/components/organisms/DataTable";
import FilterBar from "@/components/molecules/FilterBar";
import { Plus } from "lucide-react";
import SearchIcon from "@/components/atoms/icons/SearchIcon";
import { colors } from "@/config";
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
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={positionUiCopy.listing.searchPlaceholder}
        searchIcon={
          <SearchIcon size={16} style={{ color: colors.brown[300] }} />
        }
        action={{
          label: positionUiCopy.listing.newAction,
          onClick: () => navigate(positionRoutePaths.create),
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
            data={filteredPositions}
            columns={columns}
            emptyMessage={positionUiCopy.listing.emptyMessage}
            getId={(position) => position.idPositions}
          />
          <div className="mt-4 flex items-center justify-between text-sm text-brown-700">
            <span>
              Pagina {pagination.currentPage} de{" "}
              {Math.max(pagination.totalPages, 1)}
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
    </PositionHistoryTemplate>
  );
}
