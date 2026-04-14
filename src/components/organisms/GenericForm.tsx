import type { ChangeEvent, FormEvent } from "react";

export interface FormField {
  name: string;
  label: string;
  type?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  inputMode?:
    | "text"
    | "email"
    | "tel"
    | "search"
    | "url"
    | "none"
    | "numeric"
    | "decimal";
  colSpan?: 1 | 2;
  as?: "input" | "select" | "textarea";
}

export interface GenericFormProps<T> {
  fields: FormField[];
  values: T;
  setValues: (values: T) => void;
  onSubmit: (e: FormEvent) => void;
  saving?: boolean;
  onCancel?: () => void;
}

export default function GenericForm<T extends Record<string, unknown>>({
  fields,
  values,
  setValues,
  onSubmit,
  saving,
  onCancel,
}: GenericFormProps<T>) {
  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value, type } = e.target;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      setValues({
        ...values,
        [name]: e.target.checked,
      });
    } else {
      setValues({
        ...values,
        [name]: value,
      });
    }
  }

  return (
    <form
      className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto p-8 md:p-10 border"
      style={{ borderColor: "#e8d5c9" }}
      onSubmit={onSubmit}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => {
          const fieldContainerClass = field.colSpan === 2 ? "md:col-span-2" : "";

          if (field.as === "select" && field.options) {
            return (
              <div key={field.name} className={fieldContainerClass}>
                <label
                  className="text-xs font-semibold uppercase tracking-wide mb-1 block"
                  style={{ color: "#7a4430" }}
                >
                  {field.label}
                  {field.required ? " *" : ""}
                </label>
                <select
                  className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                  style={{ borderColor: "#e8d5c9", color: "#2C1810" }}
                  name={field.name}
                  value={
                    values[field.name] as
                      | string
                      | number
                      | readonly string[]
                      | undefined
                  }
                  onChange={handleChange}
                  required={field.required}
                >
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }
          if (field.as === "textarea") {
            return (
              <div
                key={field.name}
                className={field.colSpan === 2 ? "md:col-span-2" : fieldContainerClass}
              >
                <label
                  className="text-xs font-semibold uppercase tracking-wide mb-1 block"
                  style={{ color: "#7a4430" }}
                >
                  {field.label}
                  {field.required ? " *" : ""}
                </label>
                <textarea
                  className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none resize-none"
                  style={{ borderColor: "#e8d5c9", color: "#2C1810" }}
                  name={field.name}
                  value={
                    values[field.name] as
                      | string
                      | number
                      | readonly string[]
                      | undefined
                  }
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  maxLength={field.maxLength}
                  rows={3}
                />
              </div>
            );
          }
          // checkbox
          if (field.type === "checkbox") {
            return (
              <div
                key={field.name}
                className="flex items-center gap-2 md:col-span-2"
              >
                <input
                  type="checkbox"
                  name={field.name}
                  checked={!!values[field.name]}
                  onChange={handleChange}
                />
                <label
                  className="font-medium text-xs"
                  style={{ color: "#7a4430" }}
                >
                  {field.label}
                </label>
              </div>
            );
          }
          // default input
          return (
            <div key={field.name} className={fieldContainerClass}>
              <label
                className="text-xs font-semibold uppercase tracking-wide mb-1 block"
                style={{ color: "#7a4430" }}
              >
                {field.label}
                {field.required ? " *" : ""}
              </label>
              <input
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                style={{ borderColor: "#e8d5c9", color: "#2C1810" }}
                type={field.type || "text"}
                name={field.name}
                value={
                  values[field.name] as
                    | string
                    | number
                    | readonly string[]
                    | undefined
                }
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                maxLength={field.maxLength}
                inputMode={field.inputMode}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 justify-end mt-8">
        {onCancel && (
          <button
            type="button"
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: "#f5ede8", color: "#7a4430" }}
            onClick={onCancel}
            disabled={saving}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #C9A227, #a8811a)" }}
          disabled={saving}
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
