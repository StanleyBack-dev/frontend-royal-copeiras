import { useState } from "react";
import DataTable, { DataTableColumn } from "../components/organisms/DataTable";
import ModalForm from "../components/organisms/ModalForm";
import FilterBar from "../components/molecules/FilterBar";
import { Plus } from "lucide-react";
import SearchIcon from "../components/atoms/icons/SearchIcon";
import { colors } from "../config";
import EmailIcon from "../components/atoms/icons/EmailIcon";
import PhoneIcon from "../components/atoms/icons/PhoneIcon";
import type { Customer } from "../api/customers/schema";
import { useCustomers } from "../hooks/customers/useCustomers";

const emptyCustomer: import("../api/customers/schema").CreateCustomerPayload = {
  name: "",
  document: "",
  type: "individual",
  email: "",
  phone: "",
  birthDate: "",
  address: "",
  isActive: true,
};

export default function Customers() {
  // TODO: Trocar pelo userId real
  const userId = "mock-user-id";
  const { customers, loading, saving, setCustomers, save } =
    useCustomers(userId);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] =
    useState<import("../api/customers/schema").CreateCustomerPayload>(
      emptyCustomer,
    );

  function openCreate() {
    setEditing(null);
    setForm(emptyCustomer);
    setShowModal(true);
  }

  function openEdit(customer: Customer) {
    setEditing(customer);
    setForm({
      name: customer.name,
      document: customer.document,
      type: customer.type,
      email: customer.email || "",
      phone: customer.phone || "",
      birthDate: customer.birthDate || "",
      address: customer.address || "",
      isActive: customer.isActive,
    });
    setShowModal(true);
  }

  async function handleSave(
    formData: import("../api/customers/schema").CreateCustomerPayload,
  ) {
    await save(formData, editing);
    setShowModal(false);
  }

  function remove(id: string) {
    if (!confirm("Excluir este cliente?")) return;
    // TODO: implementar deleção no backend/api
    // await deleteCustomer(id, userId);
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
  ];

  return (
    <div className="space-y-6">
      <FilterBar
        search={search}
        setSearch={setSearch}
        onAction={openCreate}
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
          onEdit={openEdit}
          onRemove={(c) => remove(c.idCustomers)}
          getId={(c) => c.idCustomers}
        />
      )}
      <ModalForm
        open={showModal}
        title={editing ? "Editar Cliente" : "Novo Cliente"}
        onClose={() => setShowModal(false)}
        onSave={() => handleSave(form)}
        saving={saving}
      >
        <></>
      </ModalForm>
    </div>
  );
}
