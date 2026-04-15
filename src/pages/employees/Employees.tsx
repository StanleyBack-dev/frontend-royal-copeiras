import DataTable from "@/components/organisms/DataTable";
import FilterBar from "@/components/molecules/FilterBar";
import { Plus } from "lucide-react";
import SearchIcon from "@/components/atoms/icons/SearchIcon";
import { colors } from "@/config";
import { useNavigate } from "react-router-dom";
import EmployeeHistoryTemplate from "@/components/templates/employees/EmployeeHistoryTemplate";
import { employeeUiCopy, useEmployeesList } from "@/features/employees";
import { useEmployeesContext } from "@/features/employees/context/useEmployeesContext";
import { employeeRoutePaths } from "@/router";

export default function Employees() {
  const { employees, loading } = useEmployeesContext();
  const navigate = useNavigate();
  const { search, setSearch, filteredEmployees, columns } = useEmployeesList({
    employees,
  });

  return (
    <EmployeeHistoryTemplate>
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={employeeUiCopy.listing.searchPlaceholder}
        searchIcon={
          <SearchIcon size={16} style={{ color: colors.brown[300] }} />
        }
        action={{
          label: employeeUiCopy.listing.newAction,
          onClick: () => navigate(employeeRoutePaths.create),
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
          data={filteredEmployees}
          columns={columns}
          emptyMessage={employeeUiCopy.listing.emptyMessage}
          getId={(employee) => employee.idEmployees}
        />
      )}
    </EmployeeHistoryTemplate>
  );
}
