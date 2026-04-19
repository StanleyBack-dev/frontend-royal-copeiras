import { Fragment } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";

export interface FormField {
  name: string;
  label: string;
  type?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
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
  errors?: Partial<Record<Extract<keyof T, string>, string>>;
  saving?: boolean;
  submitDisabled?: boolean;
  onCancel?: () => void;
  contentAfterFieldName?: string;
  contentAfterField?: ReactNode;
  children?: ReactNode;
}

export default function GenericForm<T extends object>({
  fields,
  values,
  setValues,
  onSubmit,
  errors,
  saving,
  submitDisabled,
  onCancel,
  contentAfterFieldName,
  contentAfterField,
  children,
}: GenericFormProps<T>) {
  const valuesRecord = values as Record<string, unknown>;
  const errorsRecord = (errors ?? {}) as Record<string, string | undefined>;

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
      className="mx-auto w-full max-w-3xl rounded-2xl border bg-white p-4 shadow-2xl sm:p-6 lg:p-8"
      style={{ borderColor: "#e8d5c9" }}
      onSubmit={onSubmit}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => {
          const fieldContainerClass =
            field.colSpan === 2 ? "md:col-span-2" : "";

          if (field.as === "select" && field.options) {
            const fieldNode = (
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
                  style={{
                    borderColor: errorsRecord[field.name]
                      ? "#c2410c"
                      : "#e8d5c9",
                    color: "#2C1810",
                    background: field.disabled ? "#f5ede8" : "#fff",
                  }}
                  name={field.name}
                  value={
                    valuesRecord[field.name] as
                      | string
                      | number
                      | readonly string[]
                      | undefined
                  }
                  onChange={handleChange}
                  required={field.required}
                  disabled={field.disabled}
                  aria-invalid={!!errorsRecord[field.name]}
                >
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errorsRecord[field.name] && (
                  <p className="mt-1 text-xs" style={{ color: "#c2410c" }}>
                    {errorsRecord[field.name]}
                  </p>
                )}
              </div>
            );

            if (contentAfterFieldName === field.name && contentAfterField) {
              return (
                <Fragment key={`${field.name}-with-content`}>
                  {fieldNode}
                  <div className="md:col-span-2">{contentAfterField}</div>
                </Fragment>
              );
            }

            return fieldNode;
          }
          if (field.as === "textarea") {
            const fieldNode = (
              <div
                key={field.name}
                className={
                  field.colSpan === 2 ? "md:col-span-2" : fieldContainerClass
                }
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
                  style={{
                    borderColor: errorsRecord[field.name]
                      ? "#c2410c"
                      : "#e8d5c9",
                    color: "#2C1810",
                    background: field.disabled ? "#f5ede8" : "#fff",
                  }}
                  name={field.name}
                  value={
                    valuesRecord[field.name] as
                      | string
                      | number
                      | readonly string[]
                      | undefined
                  }
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  readOnly={field.readOnly}
                  disabled={field.disabled}
                  maxLength={field.maxLength}
                  aria-invalid={!!errorsRecord[field.name]}
                  aria-readonly={field.readOnly}
                  rows={3}
                />
                {errorsRecord[field.name] && (
                  <p className="mt-1 text-xs" style={{ color: "#c2410c" }}>
                    {errorsRecord[field.name]}
                  </p>
                )}
              </div>
            );

            if (contentAfterFieldName === field.name && contentAfterField) {
              return (
                <Fragment key={`${field.name}-with-content`}>
                  {fieldNode}
                  <div className="md:col-span-2">{contentAfterField}</div>
                </Fragment>
              );
            }

            return fieldNode;
          }
          // checkbox
          if (field.type === "checkbox") {
            const fieldNode = (
              <div
                key={field.name}
                className="flex items-center gap-2 md:col-span-2"
              >
                <input
                  type="checkbox"
                  name={field.name}
                  checked={!!valuesRecord[field.name]}
                  onChange={handleChange}
                  disabled={field.disabled}
                  aria-invalid={!!errorsRecord[field.name]}
                />
                <label
                  className="font-medium text-xs"
                  style={{ color: "#7a4430" }}
                >
                  {field.label}
                </label>
                {errorsRecord[field.name] && (
                  <p className="text-xs" style={{ color: "#c2410c" }}>
                    {errorsRecord[field.name]}
                  </p>
                )}
              </div>
            );

            if (contentAfterFieldName === field.name && contentAfterField) {
              return (
                <Fragment key={`${field.name}-with-content`}>
                  {fieldNode}
                  <div className="md:col-span-2">{contentAfterField}</div>
                </Fragment>
              );
            }

            return fieldNode;
          }
          // default input
          const fieldNode = (
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
                style={{
                  borderColor: errorsRecord[field.name] ? "#c2410c" : "#e8d5c9",
                  color: "#2C1810",
                  background: field.disabled ? "#f5ede8" : "#fff",
                }}
                type={field.type || "text"}
                name={field.name}
                value={
                  valuesRecord[field.name] as
                    | string
                    | number
                    | readonly string[]
                    | undefined
                }
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                readOnly={field.readOnly}
                disabled={field.disabled}
                maxLength={field.maxLength}
                inputMode={field.inputMode}
                aria-invalid={!!errorsRecord[field.name]}
                aria-readonly={field.readOnly}
              />
              {errorsRecord[field.name] && (
                <p className="mt-1 text-xs" style={{ color: "#c2410c" }}>
                  {errorsRecord[field.name]}
                </p>
              )}
            </div>
          );

          if (contentAfterFieldName === field.name && contentAfterField) {
            return (
              <Fragment key={`${field.name}-with-content`}>
                {fieldNode}
                <div className="md:col-span-2">{contentAfterField}</div>
              </Fragment>
            );
          }

          return fieldNode;
        })}
      </div>
      {children ? <div className="mt-6">{children}</div> : null}
      <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm font-medium"
            style={{ background: "#f5ede8", color: "#7a4430" }}
            onClick={onCancel}
            disabled={saving}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #C9A227, #a8811a)" }}
          disabled={saving || submitDisabled}
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
