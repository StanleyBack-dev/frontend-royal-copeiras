import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCustomers } from "../../hooks/customers/useCustomers";
import type {
  Customer,
  CreateCustomerPayload,
} from "../../api/customers/schema";
import CustomerFormTemplate from "../../components/templates/customers/CustomerFormTemplate";
import type { FormField } from "../../components/organisms/GenericForm";
import {
  formatCPF,
  formatCNPJ,
  formatLandline,
  formatPhone,
  onlyDigits,
} from "../../utils/format";
import { customerSchema } from "../../validation/customer";

type CustomerFormValues = {
  name: string;
  cpf: string;
  cnpj: string;
  type: "individual" | "company";
  contactType: "mobile" | "landline";
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
};

const emptyCustomer: CustomerFormValues = {
  name: "",
  cpf: "",
  cnpj: "",
  type: "individual",
  contactType: "mobile",
  email: "",
  phone: "",
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
          cpf: found.type === "individual" ? found.document : "",
          cnpj: found.type === "company" ? found.document : "",
          type: found.type,
          contactType:
            onlyDigits(found.phone || "").length > 10 ? "mobile" : "landline",
          email: found.email || "",
          phone: found.phone || "",
          address: found.address || "",
          isActive: found.isActive,
        });
      }
    } else {
      setEditing(null);
      setForm(emptyCustomer);
    }
  }, [mode, id, customers]);

  function handleFieldChange(
    field: string,
    value: string,
    contactType?: CustomerFormValues["contactType"],
  ) {
    if (field === "phone") {
      return contactType === "landline"
        ? formatLandline(value)
        : formatPhone(value);
    }
    if (field === "cpf") {
      return formatCPF(value);
    }
    if (field === "cnpj") {
      return formatCNPJ(value);
    }
    return value;
  }

  function validateForm(values: CustomerFormValues) {
    const data = {
      cpf:
        values.type === "individual"
          ? onlyDigits(values.cpf ?? "", 11)
          : undefined,
      cnpj:
        values.type === "company"
          ? onlyDigits(values.cnpj ?? "", 14)
          : undefined,
      name: values.name,
      type: values.type,
      contactType: values.contactType,
      email: values.email,
      phone:
        values.contactType === "mobile"
          ? onlyDigits(values.phone, 11)
          : onlyDigits(values.phone, 10),
      address: values.address,
      isActive: values.isActive,
    };
    return customerSchema.safeParse(data);
  }

  function buildPayload(values: CustomerFormValues): CreateCustomerPayload {
    return {
      name: values.name,
      document:
        values.type === "individual"
          ? onlyDigits(values.cpf, 11)
          : onlyDigits(values.cnpj, 14),
      type: values.type,
      email: values.email,
      phone:
        values.contactType === "mobile"
          ? onlyDigits(values.phone, 11)
          : onlyDigits(values.phone, 10),
      address: values.address,
      isActive: values.isActive,
    };
  }

  async function handleSave(values: CustomerFormValues) {
    const result = validateForm(values);
    if (!result.success) {
      alert(
        result.error.issues
          .map((e: { message: string }) => e.message)
          .join("\n"),
      );
      return;
    }
    await save(buildPayload(values), editing);
    navigate("/customers");
  }

  // Campos dinâmicos para CPF/CNPJ
  const fields: FormField[] = [
    {
      name: "name",
      label: "Nome",
      required: true,
      placeholder: "Maria Aparecida da Silva",
      maxLength: 120,
      colSpan: 2,
    },
    {
      name: "type",
      label: "Tipo",
      as: "select",
      options: [
        { value: "individual", label: "Pessoa Física" },
        { value: "company", label: "Empresa" },
      ],
    },
    ...(form.type === "individual"
      ? [
          {
            name: "cpf",
            label: "CPF",
            placeholder: "123.456.789-09",
            maxLength: 14,
            inputMode: "numeric" as const,
          },
        ]
      : [
          {
            name: "cnpj",
            label: "CNPJ",
            placeholder: "12.345.678/0001-90",
            maxLength: 18,
            inputMode: "numeric" as const,
          },
        ]),
    {
      name: "contactType",
      label: "Tipo de Telefone",
      as: "select",
      options: [
        { value: "mobile", label: "Móvel" },
        { value: "landline", label: "Fixo" },
      ],
    },
    {
      name: "phone",
      label: "Telefone",
      placeholder:
        form.contactType === "landline" ? "(11) 3456-7890" : "(11) 91234-5678",
      maxLength: form.contactType === "landline" ? 14 : 15,
      inputMode: "tel",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "maria.silva@empresa.com",
      maxLength: 120,
      inputMode: "email",
      colSpan: 2,
    },
    {
      name: "address",
      label: "Endereço",
      placeholder: "Rua das Flores, 123 - Centro",
      maxLength: 255,
      colSpan: 2,
    },
    {
      name: "isActive",
      label: "Ativo",
      type: "checkbox",
    },
  ];
  // Customiza o setValues para aplicar formatação
  function handleSetValues(newValues: CustomerFormValues) {
    setForm((prev) => {
      let cpfValue = newValues.cpf ?? prev.cpf ?? "";
      let cnpjValue = newValues.cnpj ?? prev.cnpj ?? "";
      let phoneValue = newValues.phone ?? prev.phone ?? "";
      if (newValues.type && newValues.type !== prev.type) {
        if (newValues.type === "individual") {
          cnpjValue = "";
        } else {
          cpfValue = "";
        }
      }
      if (newValues.contactType && newValues.contactType !== prev.contactType) {
        phoneValue = "";
      }
      return {
        ...newValues,
        phone: handleFieldChange(
          "phone",
          phoneValue,
          newValues.contactType ?? prev.contactType,
        ),
        cpf: handleFieldChange("cpf", cpfValue),
        cnpj: handleFieldChange("cnpj", cnpjValue),
      };
    });
  }

  return (
    <CustomerFormTemplate<CustomerFormValues>
      title={mode === "edit" ? "Editar Cliente" : "Novo Cliente"}
      values={form}
      setValues={handleSetValues}
      fields={fields}
      onSubmit={handleSave}
      saving={saving}
      onCancel={() => navigate("/customers")}
    />
  );
}
