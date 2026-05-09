import { useNavigate, useParams } from "react-router-dom";
import PositionFormTemplate from "@/components/templates/positions/PositionFormTemplate";
import {
  getPositionFormFields,
  positionUiCopy,
  type PositionFormValues,
  usePositionForm,
} from "@/features/positions";
import { usePositionsContext } from "@/features/positions/context/usePositionsContext";
import { useToast } from "@/shared/toast/useToast";
import { positionRoutePaths } from "@/router";

export default function PositionForm({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { positions, save, saving } = usePositionsContext();
  const { showError } = useToast();
  const { form, editing, errors, setForm, submit } = usePositionForm({
    mode,
    id,
    positions,
  });

  async function handleSave(values: PositionFormValues) {
    const result = submit(values);

    if (!result.success || !result.payload) {
      showError(
        positionUiCopy.errors.invalidFormData,
        (result.errors || [positionUiCopy.errors.invalidFormData]).join("\n"),
      );
      return;
    }

    await save(result.payload, editing);
    navigate(positionRoutePaths.list);
  }

  return (
    <PositionFormTemplate<PositionFormValues>
      title={
        mode === "edit"
          ? positionUiCopy.form.editTitle
          : positionUiCopy.form.createTitle
      }
      values={form}
      setValues={setForm}
      fields={getPositionFormFields(form, { isEditing: mode === "edit" })}
      onSubmit={handleSave}
      errors={errors}
      saving={saving}
      onCancel={() => navigate(positionRoutePaths.list)}
    />
  );
}
