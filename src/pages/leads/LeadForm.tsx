import GenericForm from "@/components/organisms/GenericForm";
import LoadingOverlay from "@/components/molecules/LoadingOverlay";
import ManagementPanelTemplate from "@/components/templates/management/ManagementPanelTemplate";
import {
  getLeadFormFields,
  leadUiCopy,
  type LeadFormValues,
  useLeadForm,
} from "@/features/leads";
import { useLeadsContext } from "@/features/leads/context/useLeadsContext";
import { useToast } from "@/shared/toast/useToast";
import { leadRoutePaths } from "@/router";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function LeadForm({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, save, saving, ensureLeadLoaded, loading } = useLeadsContext();
  const { showError } = useToast();
  const { form, editing, errors, setForm, submit } = useLeadForm({
    mode,
    id,
    leads,
  });

  const leadInList = leads.some((lead) => lead.idLeads === id);

  // Re-run whenever the record is missing from the list — not just on mount —
  // so a background list refresh that drops it is recovered instead of leaving
  // the form blank.
  useEffect(() => {
    if (mode === "edit" && id && !leadInList) {
      void ensureLeadLoaded(id);
    }
  }, [mode, id, leadInList, ensureLeadLoaded]);

  const isLoadingLeadForEdit = mode === "edit" && !editing && loading;

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
    navigate(leadRoutePaths.list);
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
      <LoadingOverlay open={isLoadingLeadForEdit} label="Carregando lead..." />
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
        onCancel={() => navigate(leadRoutePaths.list)}
      />
    </ManagementPanelTemplate>
  );
}
