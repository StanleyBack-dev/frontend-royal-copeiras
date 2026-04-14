import { useState } from "react";
import DataTable, {
  DataTableColumn,
} from "../../components/organisms/DataTable";
import FilterBar from "../../components/molecules/FilterBar";
import { Plus } from "lucide-react";
import SearchIcon from "../../components/atoms/icons/SearchIcon";
import { colors } from "../../config";
import EmailIcon from "../../components/atoms/icons/EmailIcon";
import PhoneIcon from "../../components/atoms/icons/PhoneIcon";
import EditIcon from "../../components/atoms/icons/EditIcon";
import DeleteIcon from "../../components/atoms/icons/DeleteIcon";
import { Link, useNavigate } from "react-router-dom";
import type { Customer } from "../../api/customers/schema";
import { useCustomers } from "../../hooks/customers/useCustomers";
import CustomerHistoryTemplate from "../../components/templates/customers/CustomerHistoryTemplate";

export default function Customers() {
  // TODO: Trocar pelo userId real
  const userId = "mock-user-id";
  const { customers, loading, setCustomers } = useCustomers(userId);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  function remove(id: string) {
    if (!confirm("Excluir este cliente?")) return;
    // TODO: implementar deleção no backend/api
    setCustomers((prev) => prev.filter((c) => c.idCustomers !== id));
  }

  const filtered = Array.isArray(customers)
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
          (c.phone || "").includes(search),
      )
    : [];

  const columns: DataTableColumn<Customer>[] = [
    {
      key: "name",
      label: "Nome",
      render: (c) => (
        <span style={{ color: colors.brown[800], fontWeight: 600 }}>
          {c.name}
        </span>
      ),
    },
    {
      key: "document",
      label: "Documento",
    },
    {
      key: "type",
      label: "Tipo",
      render: (c) => (c.type === "company" ? "Empresa" : "Pessoa Física"),
    },
    {
      key: "email",
      label: "Email",
      render: (c) => (
        <span className="flex items-center gap-1">
          {c.email}
          {c.email && <EmailIcon size={14} />}
        </span>
      ),
    },
    {
      key: "phone",
      label: "Telefone",
      render: (c) => (
        <span className="flex items-center gap-1">
          {c.phone}
          {c.phone && <PhoneIcon size={14} />}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Ativo",
      render: (c) => (c.isActive ? "Sim" : "Não"),
    },
    {
      key: "actions",
      label: "Ações",
      render: (c) => (
        <div className="flex gap-2">
          <Link
            to={`/customers/${c.idCustomers}/edit`}
            title="Editar"
            className="hover:text-yellow-700"
            style={{ display: "flex", alignItems: "center" }}
          >
            <EditIcon size={18} />
          </Link>
          <button
            onClick={() => remove(c.idCustomers)}
            title="Excluir"
            className="hover:text-red-700"
            style={{ display: "flex", alignItems: "center" }}
          >
            <DeleteIcon size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <CustomerHistoryTemplate>
      <FilterBar
        search={search}
        setSearch={setSearch}
        onAction={() => navigate("/customers/new")}
        actionLabel="Novo Cliente"
        placeholder="Buscar clientes..."
        icon={<SearchIcon size={16} style={{ color: colors.brown[300] }} />}
        leftIcon={<Plus size={16} />}
      />
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: "#C9A227", borderTopColor: "transparent" }}
          />
        </div>
      ) : (
        <DataTable<Customer>
          data={filtered}
          columns={columns}
          getId={(c) => c.idCustomers}
        />
      )}
    </CustomerHistoryTemplate>
  );
}
