import { useCallback, useEffect, useState } from "react";
import {
  type Employee,
  type CreateEmployeePayload,
} from "../../api/employees/schema";
import {
  fetchEmployees,
  saveEmployee,
} from "../../features/employees/services/employee.service";
import { employeeUiCopy } from "../../features/employees/model/messages";
import { useToast } from "../../shared/toast/useToast";

export interface UseEmployeesResult {
  employees: Employee[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  load: () => Promise<void>;
  save: (
    formData: CreateEmployeePayload,
    editing?: Employee | null,
  ) => Promise<void>;
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

export function useEmployees(userId: string): UseEmployeesResult {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showError, showSuccess } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchEmployees(userId);
      setEmployees(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : employeeUiCopy.errors.loadEmployeesFallback;
      setError(message);
      showError(employeeUiCopy.errors.loadEmployeesFallback, message);
    } finally {
      setLoading(false);
    }
  }, [showError, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(
    async (formData: CreateEmployeePayload, editing?: Employee | null) => {
      setSaving(true);
      setError(null);

      try {
        await saveEmployee({ userId, formData, editing });
        showSuccess(
          editing
            ? employeeUiCopy.success.updateEmployee
            : employeeUiCopy.success.createEmployee,
        );
        await load();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : employeeUiCopy.errors.saveEmployeeFallback;
        setError(message);
        showError(employeeUiCopy.errors.saveEmployeeFallback, message);
      } finally {
        setSaving(false);
      }
    },
    [userId, load, showError, showSuccess],
  );

  return {
    employees,
    loading,
    saving,
    error,
    load,
    save,
    setEmployees,
  };
}
