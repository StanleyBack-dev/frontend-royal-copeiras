import DataTable from "@/components/organisms/DataTable";
import FilterBar from "@/components/molecules/FilterBar";
import ListFiltersPanel from "@/components/molecules/ListFiltersPanel";
import ListPager from "@/components/molecules/ListPager";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmployeeHistoryTemplate from "@/components/templates/employees/EmployeeHistoryTemplate";
import { employeeUiCopy, useEmployeesList } from "@/features/employees";
import { useEmployeesContext } from "@/features/employees/context/useEmployeesContext";
import { employeeRoutePaths } from "@/router";

export default function Employees() {
  const { employees, loading, pagination, setLimit, nextPage, prevPage } =
    useEmployeesContext();
  const navigate = useNavigate();
  const { search, setSearch, filteredEmployees, columns } = useEmployeesList({
    employees,
  });

  return (
    <EmployeeHistoryTemplate>
      <FilterBar
        action={{
          label: employeeUiCopy.listing.newAction,
          onClick: () => navigate(employeeRoutePaths.create),
          leftIcon: <Plus size={16} />,
        }}
      />
      <ListFiltersPanel
        searchValue={search}
        searchPlaceholder={employeeUiCopy.listing.searchPlaceholder}
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
            data={filteredEmployees}
            columns={columns}
            emptyMessage={employeeUiCopy.listing.emptyMessage}
            getId={(employee) => employee.idEmployees}
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
    </EmployeeHistoryTemplate>
  );
}
