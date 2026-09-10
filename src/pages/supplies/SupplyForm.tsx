import { useNavigate, useParams } from "react-router-dom";
import SupplyFormTemplate from "@/components/templates/supplies/SupplyFormTemplate";
import {
  getSupplyFormFields,
  supplyUiCopy,
  type SupplyFormValues,
  useSupplyForm,
} from "@/features/supplies";
import { useSuppliesContext } from "@/features/supplies/context/useSuppliesContext";
import { useToast } from "@/shared/toast/useToast";
import { supplyRoutePaths } from "@/router";

export default function SupplyForm({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { supplies, save, saving } = useSuppliesContext();
  const { showError } = useToast();
  const { form, editing, errors, setForm, submit } = useSupplyForm({
    mode,
    id,
    supplies,
  });

  async function handleSave(values: SupplyFormValues) {
    const result = submit(values);

    if (!result.success || !result.payload) {
      showError(
        supplyUiCopy.errors.invalidFormData,
        (result.errors || [supplyUiCopy.errors.invalidFormData]).join("\n"),
      );
      return;
    }

    await save(result.payload, editing);
    navigate(supplyRoutePaths.list);
  }

  return (
    <SupplyFormTemplate<SupplyFormValues>
      title={
        mode === "edit"
          ? supplyUiCopy.form.editTitle
          : supplyUiCopy.form.createTitle
      }
      values={form}
      setValues={setForm}
      fields={getSupplyFormFields(form, { isEditing: mode === "edit" })}
      onSubmit={handleSave}
      errors={errors}
      saving={saving}
      onCancel={() => navigate(supplyRoutePaths.list)}
    />
  );
}
