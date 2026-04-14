import GenericForm, { FormField } from "../../organisms/GenericForm";

export interface CustomerFormTemplateProps<T extends Record<string, unknown>> {
  title: string;
  values: T;
  setValues: (values: T) => void;
  fields: FormField[];
  onSubmit: (values: T) => Promise<void>;
  saving?: boolean;
  onCancel?: () => void;
}

export default function CustomerFormTemplate<
  T extends Record<string, unknown>,
>({
  title,
  values,
  setValues,
  fields,
  onSubmit,
  saving,
  onCancel,
}: CustomerFormTemplateProps<T>) {
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(values);
  }

  return (
    <div
      className="w-full h-full bg-white p-0 rounded-xl shadow-sm border overflow-hidden flex flex-col"
      style={{ borderColor: "#e8d5c9" }}
    >
      <div className="px-8 pt-8 pb-0">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
      </div>
      <div className="flex-1 flex flex-col justify-center px-8 pb-8">
        <GenericForm
          fields={fields}
          values={values}
          setValues={setValues}
          onSubmit={handleSubmit}
          saving={saving}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
}
