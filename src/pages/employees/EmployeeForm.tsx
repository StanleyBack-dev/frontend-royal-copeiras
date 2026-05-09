import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import EmployeeFormTemplate from "@/components/templates/employees/EmployeeFormTemplate";
import {
  employeeUiCopy,
  getEmployeeFormFields,
  type EmployeeFormValues,
  useEmployeeForm,
} from "@/features/employees";
import { useEmployeesContext } from "@/features/employees/context/useEmployeesContext";
import { fetchPositions } from "@/features/positions/services/position.service";
import type { Position } from "@/api/positions/schema";
import { useToast } from "@/shared/toast/useToast";

export default function EmployeeForm({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { employees, save, saving } = useEmployeesContext();
  const [positions, setPositions] = useState<Position[]>([]);
  const { showError } = useToast();
  const { form, editing, errors, setForm, submit } = useEmployeeForm({
    mode,
    id,
    employees,
  });

  useEffect(() => {
    let isMounted = true;

    void fetchPositions({ page: 1, limit: 100 })
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setPositions(result.items);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setPositions([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const positionOptions = positions
    .filter(
      (position) =>
        position.isActive || position.idPositions === form.idPositions,
    )
    .map((position) => ({
      value: position.idPositions,
      label: position.name,
    }));

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
      fields={getEmployeeFormFields(form, {
        isEditing: mode === "edit",
        positionOptions,
      })}
      onSubmit={handleSave}
      errors={errors}
      saving={saving}
      onCancel={() => navigate("/funcionarios")}
    />
  );
}
