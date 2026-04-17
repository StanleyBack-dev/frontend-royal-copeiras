import GenericForm, { FormField } from "../../organisms/GenericForm";

export interface UserFormTemplateProps<T extends Record<string, unknown>> {
  title: string;
  values: T;
  setValues: (values: T) => void;
  fields: FormField[];
  onSubmit: (values: T) => Promise<void>;
  errors?: Partial<Record<Extract<keyof T, string>, string>>;
  saving?: boolean;
  onCancel?: () => void;
}

export default function UserFormTemplate<T extends Record<string, unknown>>({
  title,
  values,
  setValues,
  fields,
  onSubmit,
  errors,
  saving,
  onCancel,
}: UserFormTemplateProps<T>) {
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(values);
  }

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-xl border bg-white shadow-sm"
      style={{ borderColor: "#e8d5c9" }}
    >
      <div className="px-4 pb-0 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
        <h2 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl">{title}</h2>
      </div>
      <div className="flex flex-1 flex-col justify-center px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
        <GenericForm
          fields={fields}
          values={values}
          setValues={setValues}
          onSubmit={handleSubmit}
          errors={errors}
          saving={saving}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
}
