// Organism: CustomersTable

import type { Customer } from "../../../api/customers/types";
import { User, Building2, Phone, Mail, Pencil, Trash2 } from "lucide-react";
import Table from "@atoms/Table";
import Button from "@atoms/Button";

export interface CustomersTableProps {
  clients: Customer[];
  onEdit: (customer: Customer) => void;
  onRemove: (id: string) => void;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
}

export default function CustomersTable({
  clients,
  onEdit,
  onRemove,
}: CustomersTableProps) {
  const columns = [
    {
      key: "name",
      label: "Cliente",
      render: (customer: Customer) => (
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #C9A227, #a8811a)" }}
          >
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold" style={{ color: "#2C1810" }}>
              {customer.name}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "document",
      label: "Documento",
      render: (customer: Customer) => (
        <span className="text-xs" style={{ color: "#9a7060" }}>
          {customer.document}
        </span>
      ),
    },
    {
      key: "type",
      label: "Tipo",
      render: (customer: Customer) => (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
          style={
            customer.type === "company"
              ? { background: "#fdf8e7", color: "#856015" }
              : { background: "#f5ede8", color: "#5c3020" }
          }
        >
          {customer.type === "company" ? (
            <Building2 size={11} />
          ) : (
            <User size={11} />
          )}
          {customer.type === "company" ? "Empresa" : "Pessoa Física"}
        </span>
      ),
    },
    {
      key: "contact",
      label: "Contato",
      render: (customer: Customer) => (
        <div className="space-y-0.5">
          {customer.email && (
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "#7a4430" }}
            >
              <Mail size={12} />
              {customer.email}
            </div>
          )}
          {customer.phone && (
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "#7a4430" }}
            >
              <Phone size={12} />
              {customer.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Cadastro",
      render: (customer: Customer) => (
        <span className="text-xs" style={{ color: "#9a7060" }}>
          {formatDate(customer.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (customer: Customer) => (
        <div className="flex items-center gap-2 justify-end">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Pencil size={14} />}
            onClick={() => onEdit(customer)}
            style={{ color: "#C9A227" }}
          />
          <Button
            size="sm"
            variant="danger"
            leftIcon={<Trash2 size={14} />}
            onClick={() => onRemove(customer.idCustomers)}
            style={{ color: "#c22727" }}
          />
        </div>
      ),
    },
  ];

  return (
    <Table columns={columns} data={clients} rowKey={(row) => row.idCustomers} />
  );
}
