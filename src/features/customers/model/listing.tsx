import { Link } from "react-router-dom";
import type { DataTableColumn } from "../../../components/organisms/DataTable";
import EmailIcon from "../../../components/atoms/icons/EmailIcon";
import PhoneIcon from "../../../components/atoms/icons/PhoneIcon";
import EditIcon from "../../../components/atoms/icons/EditIcon";
import DeleteIcon from "../../../components/atoms/icons/DeleteIcon";
import { colors } from "../../../config";
import type { Customer } from "../../../api/customers/schema";
import { customerRoutePaths } from "../../../router";
import { customerUiCopy } from "./messages";

interface CustomerTableColumnsParams {
  onRemove: (id: string) => void;
}

export function filterCustomersBySearch(
  customers: Customer[],
  search: string,
) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return customers;
  }

  return customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(normalizedSearch) ||
      (customer.email || "").toLowerCase().includes(normalizedSearch) ||
      (customer.phone || "").includes(search),
  );
}

export function getCustomerTableColumns({
  onRemove,
}: CustomerTableColumnsParams): DataTableColumn<Customer>[] {
  return [
    {
      key: "name",
      label: customerUiCopy.listing.columns.name,
      render: (customer) => (
        <span style={{ color: colors.brown[800], fontWeight: 600 }}>
          {customer.name}
        </span>
      ),
    },
    {
      key: "document",
      label: customerUiCopy.listing.columns.document,
    },
    {
      key: "type",
      label: customerUiCopy.listing.columns.type,
      render: (customer) =>
        customer.type === "company"
          ? customerUiCopy.form.options.company
          : customerUiCopy.form.options.person,
    },
    {
      key: "email",
      label: customerUiCopy.listing.columns.email,
      render: (customer) => (
        <span className="flex items-center gap-1">
          {customer.email}
          {customer.email && <EmailIcon size={14} />}
        </span>
      ),
    },
    {
      key: "phone",
      label: customerUiCopy.listing.columns.phone,
      render: (customer) => (
        <span className="flex items-center gap-1">
          {customer.phone}
          {customer.phone && <PhoneIcon size={14} />}
        </span>
      ),
    },
    {
      key: "isActive",
      label: customerUiCopy.listing.columns.isActive,
      render: (customer) =>
        customer.isActive
          ? customerUiCopy.listing.values.active
          : customerUiCopy.listing.values.inactive,
    },
    {
      key: "actions",
      label: customerUiCopy.listing.columns.actions,
      render: (customer) => (
        <div className="flex gap-2">
          <Link
            to={customerRoutePaths.edit(customer.idCustomers)}
            title={customerUiCopy.listing.actions.edit}
            className="hover:text-yellow-700"
            style={{ display: "flex", alignItems: "center" }}
          >
            <EditIcon size={18} />
          </Link>
          <button
            type="button"
            onClick={() => onRemove(customer.idCustomers)}
            title={customerUiCopy.listing.actions.delete}
            className="hover:text-red-700"
            style={{ display: "flex", alignItems: "center" }}
          >
            <DeleteIcon size={18} />
          </button>
        </div>
      ),
    },
  ];
}
