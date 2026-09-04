import DataTable from "@/components/organisms/DataTable";
import ListFiltersPanel from "@/components/molecules/ListFiltersPanel";
import ListPager from "@/components/molecules/ListPager";
import CustomerHistoryTemplate from "@/components/templates/customers/CustomerHistoryTemplate";
import { customerUiCopy, useCustomersList } from "@/features/customers";
import { useCustomersContext } from "@/features/customers/context/useCustomersContext";

export default function Customers() {
  const { customers, loading, pagination, setLimit, nextPage, prevPage } =
    useCustomersContext();
  const { search, setSearch, filteredCustomers, columns } = useCustomersList({
    customers,
  });

  return (
    <CustomerHistoryTemplate>
      <ListFiltersPanel
        searchValue={search}
        searchPlaceholder={customerUiCopy.listing.searchPlaceholder}
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
            data={filteredCustomers}
            columns={columns}
            emptyMessage={customerUiCopy.listing.emptyMessage}
            getId={(c) => c.idCustomers}
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
    </CustomerHistoryTemplate>
  );
}
