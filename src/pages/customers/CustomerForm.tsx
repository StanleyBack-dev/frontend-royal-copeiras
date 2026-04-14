import { useParams, useNavigate } from "react-router-dom";
import CustomerFormTemplate from "@/components/templates/customers/CustomerFormTemplate";
import {
  customerUiCopy,
  getCustomerFormFields,
  type CustomerFormValues,
  useCustomerForm,
} from "@/features/customers";
import { useCustomersContext } from "@/features/customers/context/useCustomersContext";

export default function CustomerForm({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customers, save, saving } = useCustomersContext();
  const { form, editing, errors, setForm, submit } = useCustomerForm({
    mode,
    id,
    customers,
  });

  async function handleSave(values: CustomerFormValues) {
    const result = submit(values);
    if (!result.success || !result.payload) {
      alert(
        (result.errors || [customerUiCopy.errors.invalidFormData]).join("\n"),
      );
      return;
    }
    await save(result.payload, editing);
    navigate("/customers");
  }

  return (
    <CustomerFormTemplate<CustomerFormValues>
      title={
        mode === "edit"
          ? customerUiCopy.form.editTitle
          : customerUiCopy.form.createTitle
      }
      values={form}
      setValues={setForm}
      fields={getCustomerFormFields(form)}
      onSubmit={handleSave}
      errors={errors}
      saving={saving}
      onCancel={() => navigate("/customers")}
    />
  );
}
