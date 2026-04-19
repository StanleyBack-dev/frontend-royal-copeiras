import GenericForm from "@/components/organisms/GenericForm";
import ManagementPanelTemplate from "@/components/templates/management/ManagementPanelTemplate";
import {
  getLeadFormFields,
  leadUiCopy,
  type LeadFormValues,
  useLeadForm,
} from "@/features/leads";
import { useLeadsContext } from "@/features/leads/context/useLeadsContext";
import { useToast } from "@/shared/toast/useToast";
import { useNavigate, useParams } from "react-router-dom";

export default function LeadForm({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, save, saving } = useLeadsContext();
  const { showError } = useToast();
  const { form, editing, errors, setForm, submit } = useLeadForm({
    mode,
    id,
    leads,
  });

  async function handleSave(values: LeadFormValues) {
    const result = submit(values);

    if (!result.success || !result.payload) {
      showError(
        leadUiCopy.errors.invalidFormData,
        (result.errors || [leadUiCopy.errors.invalidFormData]).join("\n"),
      );
      return;
    }

    await save(result.payload, editing);
    navigate("/eventos/leads");
  }

  return (
    <ManagementPanelTemplate
      title={
        mode === "edit"
          ? leadUiCopy.form.editTitle
          : leadUiCopy.form.createTitle
      }
      description="Mantenha os dados comerciais organizados antes da conversão em orçamento."
    >
      <GenericForm<LeadFormValues>
        fields={getLeadFormFields(form, { isEditing: mode === "edit" })}
        values={form}
        setValues={setForm}
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave(form);
        }}
        errors={errors}
        saving={saving}
        onCancel={() => navigate("/eventos/leads")}
      />
    </ManagementPanelTemplate>
  );
}
