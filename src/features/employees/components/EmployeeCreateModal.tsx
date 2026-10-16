import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import GenericForm from "@/components/organisms/GenericForm";
import type { Employee } from "@/api/employees/schema";
import type { Position } from "@/api/positions/schema";
import { getHttpErrorMessage } from "@/api/shared/http-error";
import { fetchPositions } from "@/features/positions/services/position.service";
import { useToast } from "@/shared/toast/useToast";
import { useEmployeeForm } from "../hooks/useEmployeeForm";
import { getEmployeeFormFields } from "../model/fields";
import {
  emptyEmployeeFormValues,
  type EmployeeFormValues,
} from "../model/form";
import { employeeUiCopy } from "../model/messages";
import { saveEmployee } from "../services/employee.service";

interface EmployeeCreateModalProps {
  /** Pre-fills the form, e.g. the gender a service slot requires. */
  initialValues?: Partial<EmployeeFormValues>;
  onClose: () => void;
  onCreated: (employee: Employee) => void;
}

// Stable reference: useEmployeeForm resets the form whenever this list changes.
const NO_EMPLOYEES: Employee[] = [];

/**
 * Same form, validation and payload as the Employees screen, rendered as a
 * modal so other modules (e.g. event staffing) can register someone inline.
 * Mount it only while open so each opening starts from a clean form.
 */
export default function EmployeeCreateModal({
  initialValues,
  onClose,
  onCreated,
}: EmployeeCreateModalProps) {
  const { showError, showSuccess } = useToast();
  const [positions, setPositions] = useState<Position[]>([]);
  const [saving, setSaving] = useState(false);
  const { form, errors, setForm, submit } = useEmployeeForm({
    mode: "create",
    employees: NO_EMPLOYEES,
  });

  useEffect(() => {
    if (initialValues) {
      setForm({ ...emptyEmployeeFormValues, ...initialValues });
    }
    // Applied once, on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let isMounted = true;

    void fetchPositions({ page: 1, limit: 100 })
      .then((result) => {
        if (isMounted) setPositions(result.items);
      })
      .catch(() => {
        if (isMounted) setPositions([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Lock the page behind the modal so touch scrolling stays inside it
  // (iOS Safari only honours this when both <html> and <body> are locked).
  useEffect(() => {
    const { documentElement, body } = document;
    const previousHtmlOverflow = documentElement.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    documentElement.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      documentElement.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, saving]);

  const positionOptions = positions
    .filter((position) => position.isActive)
    .map((position) => ({
      value: position.idPositions,
      label: position.name,
    }));

  async function handleSubmit(event: FormEvent) {
    // Stop the submit from reaching any form that wraps the host page.
    event.preventDefault();
    event.stopPropagation();

    const result = submit(form);
    if (!result.success || !result.payload) {
      showError(
        employeeUiCopy.errors.invalidFormData,
        (result.errors || [employeeUiCopy.errors.invalidFormData]).join("\n"),
      );
      return;
    }

    setSaving(true);
    try {
      const employee = await saveEmployee({ formData: result.payload });
      showSuccess(employeeUiCopy.success.createEmployee);
      onCreated(employee);
    } catch (error) {
      showError(
        employeeUiCopy.errors.saveEmployeeFallback,
        getHttpErrorMessage(error, employeeUiCopy.errors.saveEmployeeFallback),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    // The overlay itself is the scroll container: works on every mobile
    // browser without relying on viewport units, and `overscroll-contain`
    // keeps the gesture from chaining to the page underneath.
    <div
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="employee-create-modal-title"
    >
      <div
        className="flex min-h-full items-end justify-center pt-10 sm:items-center sm:p-4"
        onClick={(event) => {
          if (event.target === event.currentTarget && !saving) onClose();
        }}
      >
        <div className="w-full max-w-2xl rounded-t-2xl border border-[#e8d5c4] bg-white shadow-2xl sm:rounded-2xl">
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-2xl border-b border-[#f1e6de] bg-white px-5 py-4 sm:px-6">
            <div>
              <h2
                id="employee-create-modal-title"
                className="text-base font-bold text-[#2c1810]"
              >
                {employeeUiCopy.form.createTitle}
              </h2>
              <p className="text-xs text-[#9a7563]">
                {employeeUiCopy.form.createInlineDescription}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Fechar"
              className="rounded-lg p-1.5 text-[#9a7563] transition-colors hover:bg-[#f5ede8] hover:text-[#2c1810] disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-5 py-5 sm:px-6">
            <GenericForm<EmployeeFormValues>
              bare
              fields={getEmployeeFormFields(form, {
                isEditing: false,
                positionOptions,
              })}
              values={form}
              setValues={setForm}
              onSubmit={(event) => void handleSubmit(event)}
              errors={errors}
              saving={saving}
              onCancel={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
