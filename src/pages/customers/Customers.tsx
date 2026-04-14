import DataTable from "@/components/organisms/DataTable";
import FilterBar from "@/components/molecules/FilterBar";
import { Plus } from "lucide-react";
import SearchIcon from "@/components/atoms/icons/SearchIcon";
import { colors } from "@/config";
import { useNavigate } from "react-router-dom";
import CustomerHistoryTemplate from "@/components/templates/customers/CustomerHistoryTemplate";
import {
  customerUiCopy,
  useCustomersList,
} from "@/features/customers";
import { useCustomersContext } from "@/features/customers/context/useCustomersContext";
import { customerRoutePaths } from "@/router";

export default function Customers() {
  const { customers, loading, setCustomers } = useCustomersContext();
  const navigate = useNavigate();
  const { search, setSearch, filteredCustomers, columns } = useCustomersList({
    customers,
    setCustomers,
  });

  return (
    <CustomerHistoryTemplate>
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={customerUiCopy.listing.searchPlaceholder}
        searchIcon={<SearchIcon size={16} style={{ color: colors.brown[300] }} />}
        action={{
          label: customerUiCopy.listing.newAction,
          onClick: () => navigate(customerRoutePaths.create),
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
        <DataTable
          data={filteredCustomers}
          columns={columns}
          emptyMessage={customerUiCopy.listing.emptyMessage}
          getId={(c) => c.idCustomers}
        />
      )}
    </CustomerHistoryTemplate>
  );
}
