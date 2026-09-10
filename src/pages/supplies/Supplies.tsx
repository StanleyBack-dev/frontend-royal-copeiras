import DataTable from "@/components/organisms/DataTable";
import FilterBar from "@/components/molecules/FilterBar";
import ListFiltersPanel from "@/components/molecules/ListFiltersPanel";
import ListPager from "@/components/molecules/ListPager";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SupplyHistoryTemplate from "@/components/templates/supplies/SupplyHistoryTemplate";
import { supplyRoutePaths } from "@/router";
import { supplyUiCopy, useSuppliesList } from "@/features/supplies";
import { useSuppliesContext } from "@/features/supplies/context/useSuppliesContext";

export default function Supplies() {
  const { supplies, loading, pagination, setLimit, nextPage, prevPage } =
    useSuppliesContext();
  const navigate = useNavigate();
  const { search, setSearch, filteredSupplies, columns } = useSuppliesList({
    supplies,
  });

  return (
    <SupplyHistoryTemplate>
      <FilterBar
        action={{
          label: supplyUiCopy.listing.newAction,
          onClick: () => navigate(supplyRoutePaths.create),
          leftIcon: <Plus size={16} />,
        }}
      />
      <ListFiltersPanel
        searchValue={search}
        searchPlaceholder={supplyUiCopy.listing.searchPlaceholder}
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
            data={filteredSupplies}
            columns={columns}
            emptyMessage={supplyUiCopy.listing.emptyMessage}
            getId={(supply) => supply.idSupplies}
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
    </SupplyHistoryTemplate>
  );
}
