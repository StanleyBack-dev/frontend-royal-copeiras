import { useParams, useNavigate } from "react-router-dom";
import EmployeeFormTemplate from "@/components/templates/employees/EmployeeFormTemplate";
import {
  employeeUiCopy,
  getEmployeeFormFields,
  type EmployeeFormValues,
  useEmployeeForm,
} from "@/features/employees";
import { useEmployeesContext } from "@/features/employees/context/useEmployeesContext";
import { useToast } from "@/shared/toast/useToast";

export default function EmployeeForm({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { employees, save, saving } = useEmployeesContext();
  const { showError } = useToast();
  const { form, editing, errors, setForm, submit } = useEmployeeForm({
    mode,
    id,
    employees,
  });

  async function handleSave(values: EmployeeFormValues) {
    const result = submit(values);

    if (!result.success || !result.payload) {
      showError(
        employeeUiCopy.errors.invalidFormData,
        (result.errors || [employeeUiCopy.errors.invalidFormData]).join("\n"),
      );
      return;
    }

    await save(result.payload, editing);
    navigate("/funcionarios");
  }

  return (
    <EmployeeFormTemplate<EmployeeFormValues>
      title={
        mode === "edit"
          ? employeeUiCopy.form.editTitle
          : employeeUiCopy.form.createTitle
      }
      values={form}
      setValues={setForm}
      fields={getEmployeeFormFields(form, { isEditing: mode === "edit" })}
      onSubmit={handleSave}
      errors={errors}
      saving={saving}
      onCancel={() => navigate("/funcionarios")}
    />
  );
}
