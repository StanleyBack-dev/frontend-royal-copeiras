import { Link } from "react-router-dom";
import type { DataTableColumn } from "../../../components/organisms/DataTable";
import EmailIcon from "../../../components/atoms/icons/EmailIcon";
import PhoneIcon from "../../../components/atoms/icons/PhoneIcon";
import EditIcon from "../../../components/atoms/icons/EditIcon";
import { colors } from "../../../config";
import type { Employee } from "../../../api/employees/schema";
import { employeeRoutePaths } from "../../../router";
import { formatDateTimeDisplay } from "../../../utils/format";
import { formatEmployeeDocument } from "./formatters";
import { employeeUiCopy } from "./messages";

export function filterEmployeesBySearch(employees: Employee[], search: string) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return employees;
  }

  return employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(normalizedSearch) ||
      employee.position.toLowerCase().includes(normalizedSearch) ||
      (employee.email || "").toLowerCase().includes(normalizedSearch) ||
      (employee.phone || "").includes(search) ||
      (employee.document || "").includes(search),
  );
}

export function getEmployeeTableColumns(): DataTableColumn<Employee>[] {
  return [
    {
      key: "actions",
      label: employeeUiCopy.listing.columns.actions,
      render: (employee) => (
        <div className="flex gap-2">
          <Link
            to={employeeRoutePaths.edit(employee.idEmployees)}
            title={employeeUiCopy.listing.actions.edit}
            className="hover:text-yellow-700"
            style={{ display: "flex", alignItems: "center" }}
          >
            <EditIcon size={18} />
          </Link>
        </div>
      ),
    },
    {
      key: "name",
      label: employeeUiCopy.listing.columns.name,
      render: (employee) => (
        <span style={{ color: colors.brown[800], fontWeight: 600 }}>
          {employee.name}
        </span>
      ),
    },
    {
      key: "document",
      label: employeeUiCopy.listing.columns.document,
      render: (employee) => formatEmployeeDocument(employee.document),
    },
    {
      key: "position",
      label: employeeUiCopy.listing.columns.position,
    },
    {
      key: "email",
      label: employeeUiCopy.listing.columns.email,
      render: (employee) => (
        <span className="flex items-center gap-1">
          {employee.email}
          {employee.email && <EmailIcon size={14} />}
        </span>
      ),
    },
    {
      key: "phone",
      label: employeeUiCopy.listing.columns.phone,
      render: (employee) => (
        <span className="flex items-center gap-1">
          {employee.phone}
          {employee.phone && <PhoneIcon size={14} />}
        </span>
      ),
    },
    {
      key: "isActive",
      label: employeeUiCopy.listing.columns.isActive,
      render: (employee) =>
        employee.isActive
          ? employeeUiCopy.listing.values.active
          : employeeUiCopy.listing.values.inactive,
    },
    {
      key: "createdAt",
      label: employeeUiCopy.listing.columns.createdAt,
      render: (employee) => formatDateTimeDisplay(employee.createdAt),
    },
  ];
}
