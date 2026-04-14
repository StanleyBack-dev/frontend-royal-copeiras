import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCustomers } from "../../hooks/customers/useCustomers";
import type {
  Customer,
  CreateCustomerPayload,
} from "../../api/customers/schema";
import CustomerFormTemplate from "../../components/templates/customers/CustomerFormTemplate";
import type { FormField } from "../../components/organisms/GenericForm";

const emptyCustomer: CreateCustomerPayload = {
  name: "",
  document: "",
  type: "individual",
  email: "",
  phone: "",
  birthDate: "",
  address: "",
  isActive: true,
};

export default function CustomerForm({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = "mock-user-id";
  const { customers, save, saving } = useCustomers(userId);
  const [form, setForm] = useState(emptyCustomer);
  const [editing, setEditing] = useState<Customer | null>(null);

  useEffect(() => {
    if (mode === "edit" && id && customers.length) {
      const found = customers.find((c) => c.idCustomers === id);
      if (found) {
        setEditing(found);
        setForm({
          name: found.name,
          document: found.document,
          type: found.type,
          email: found.email || "",
          phone: found.phone || "",
          birthDate: found.birthDate || "",
          address: found.address || "",
          isActive: found.isActive,
        });
      }
    } else {
      setEditing(null);
      setForm(emptyCustomer);
    }
  }, [mode, id, customers]);

  async function handleSave(values: CreateCustomerPayload) {
    await save(values, editing);
    navigate("/customers");
  }

  const fields: FormField[] = [
    { name: "name", label: "Nome", required: true },
    { name: "document", label: "Documento", required: true },
    {
      name: "type",
      label: "Tipo",
      as: "select",
      options: [
        { value: "individual", label: "Pessoa Física" },
        { value: "company", label: "Empresa" },
      ],
      required: true,
    },
    { name: "email", label: "Email", type: "email" },
    { name: "phone", label: "Telefone" },
    { name: "birthDate", label: "Data de Nascimento" },
    { name: "address", label: "Endereço" },
    { name: "isActive", label: "Ativo", type: "checkbox" },
  ];
  return (
    <CustomerFormTemplate<CreateCustomerPayload>
      title={mode === "edit" ? "Editar Cliente" : "Novo Cliente"}
      initialValues={form}
      fields={fields}
      onSubmit={handleSave}
      saving={saving}
      onCancel={() => navigate("/customers")}
    />
  );
}
