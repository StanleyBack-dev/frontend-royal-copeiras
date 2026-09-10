import { useEffect, useState } from "react";
import { z } from "zod";
import type {
  CreateEmployeePayload,
  Employee,
} from "../../../api/employees/schema";
import {
  employeeFormSchema,
  emptyEmployeeFormValues,
  type EmployeeFormValues,
} from "../model/form";
import { normalizeEmployeeFormValues } from "../model/formatters";
import {
  mapEmployeeFormToPayload,
  mapEmployeeFormToValidationInput,
  mapEmployeeToFormValues,
} from "../model/mappers";
import { fetchEmployeeById } from "../services/employee.service";

interface UseEmployeeFormParams {
  mode: "create" | "edit";
  id?: string;
  employees: Employee[];
}

interface SubmitEmployeeFormResult {
  success: boolean;
  payload?: CreateEmployeePayload;
  errors?: string[];
}

type EmployeeFormErrors = Partial<
  Record<Extract<keyof EmployeeFormValues, string>, string>
>;

export function useEmployeeForm({
  mode,
  id,
  employees,
}: UseEmployeeFormParams) {
  const [form, setForm] = useState<EmployeeFormValues>(emptyEmployeeFormValues);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [errors, setErrors] = useState<EmployeeFormErrors>({});
  const [loadingEmployee, setLoadingEmployee] = useState(false);

  useEffect(() => {
    if (mode === "edit") {
      if (!id) {
        return;
      }

      const found = employees.find((employee) => employee.idEmployees === id);
      if (found) {
        setEditing(found);
        setForm(mapEmployeeToFormValues(found));
        setErrors({});
      }
      // Not in the current list page: leave the by-id effect below to load it.
      // Never blank the form out in edit mode — that is the pagination bug.
      return;
    }

    setEditing(null);
    setForm(emptyEmployeeFormValues);
    setErrors({});
  }, [employees, id, mode]);

  // Fallback for a deep link / refresh straight onto the edit form, where the
  // record sits outside the loaded list page.
  useEffect(() => {
    if (mode !== "edit" || !id || editing?.idEmployees === id) {
      return;
    }

    if (employees.some((employee) => employee.idEmployees === id)) {
      return;
    }

    let active = true;
    setLoadingEmployee(true);

    void fetchEmployeeById(id)
      .then((employee) => {
        if (!active || !employee) {
          return;
        }

        setEditing(employee);
        setForm(mapEmployeeToFormValues(employee));
        setErrors({});
      })
      .catch(() => {
        // Leave the form as-is; the user can navigate back.
      })
      .finally(() => {
        if (active) {
          setLoadingEmployee(false);
        }
      });

    return () => {
      active = false;
    };
  }, [employees, editing, id, mode]);

  function updateForm(nextValues: EmployeeFormValues) {
    setErrors({});
    setForm((previousValues) =>
      normalizeEmployeeFormValues(nextValues, previousValues),
    );
  }

  function mapValidationErrors(values: EmployeeFormValues) {
    const validationResult = validate(values);

    if (validationResult.success) {
      return {};
    }

    return validationResult.error.issues.reduce(
      (acc: EmployeeFormErrors, issue: z.ZodIssue) => {
        const field = issue.path[0];

        if (typeof field === "string" && !(field in acc)) {
          acc[field as Extract<keyof EmployeeFormValues, string>] =
            issue.message;
        }

        return acc;
      },
      {},
    );
  }

  function validate(values: EmployeeFormValues) {
    return employeeFormSchema.safeParse(
      mapEmployeeFormToValidationInput(values),
    );
  }

  function submit(values: EmployeeFormValues): SubmitEmployeeFormResult {
    const result = validate(values);

    if (!result.success) {
      setErrors(mapValidationErrors(values));

      return {
        success: false,
        errors: result.error.issues.map((issue: z.ZodIssue) => issue.message),
      };
    }

    setErrors({});

    return {
      success: true,
      payload: mapEmployeeFormToPayload(values),
    };
  }

  return {
    form,
    editing,
    errors,
    loadingEmployee,
    setForm: updateForm,
    submit,
  };
}
