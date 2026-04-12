import { useEffect, useState } from "react";
import CustomersTable from "../components/organisms/customers/CustomersTable";
import CustomersModal from "../components/organisms/customers/CustomersModal";
import CustomersFilterBar from "../components/molecules/CustomersFilterBar";
import type { Customer } from "../api/customers/types";
import { getCustomers } from "../api/customers/methods/get";
import { createCustomer } from "../api/customers/methods/create";
import { updateCustomer } from "../api/customers/methods/update";

const emptyCustomer: Omit<Customer, "idCustomers" | "createdAt" | "updatedAt"> =
  {
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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyCustomer);
  const [saving, setSaving] = useState(false);

  // TODO: Trocar pelo userId real
  const userId = "mock-user-id";

  async function load() {
    setLoading(true);
    try {
      const data = await getCustomers(userId);
      setCustomers(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

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

  async function save(
    formData: Omit<Customer, "idCustomers" | "createdAt" | "updatedAt">,
  ) {
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await updateCustomer(editing.idCustomers, formData, userId);
      } else {
        await createCustomer(formData, userId);
      }
      setShowModal(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
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

  return (
    <div className="space-y-6">
      <CustomersFilterBar
        search={search}
        setSearch={setSearch}
        onCreate={openCreate}
      />
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: "#C9A227", borderTopColor: "transparent" }}
          />
        </div>
      ) : (
        <CustomersTable
          clients={filtered}
          onEdit={openEdit}
          onRemove={remove}
        />
      )}
      <CustomersModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={save}
        saving={saving}
        editing={editing}
        initialForm={form}
      />
    </div>
  );
}
