import GenericForm from "@/components/organisms/GenericForm";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import ManagementPanelTemplate from "@/components/templates/management/ManagementPanelTemplate";
import { formatDateTimeDisplay } from "@/utils/format";
import {
  budgetUiCopy,
  getBudgetFormFields,
  buildEventDates,
  type BudgetFormValues,
  useBudgetForm,
  useBudgetPdfActions,
} from "@/features/budgets";
import { useAuthSession } from "@/features/auth";
import BudgetItemsEditor from "@/features/budgets/components/BudgetItemsEditor";
import { useBudgetsContext } from "@/features/budgets/context/useBudgetsContext";
import { useToast } from "@/shared/toast/useToast";
import { budgetRoutePaths } from "@/router";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function BudgetForm({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { budgets, leads, save, saving } = useBudgetsContext();
  const { showError } = useToast();
  const { session } = useAuthSession();
  const initialLeadId = searchParams.get("leadId") || undefined;
  const {
    form,
    editing,
    errors,
    setForm,
    addItem,
    removeItem,
    updateItem,
    totals,
    submit,
  } = useBudgetForm({
    mode,
    id,
    budgets,
    initialLeadId,
  });
  const isNonDraftLocked =
    mode === "edit" && Boolean(editing && editing.status !== "draft");
  const [pdfFrozenAt, setPdfFrozenAt] = useState<string | undefined>(
    editing?.pdfFrozenAt,
  );

  useEffect(() => {
    setPdfFrozenAt(editing?.pdfFrozenAt || undefined);
  }, [editing?.idBudgets, editing?.pdfFrozenAt]);

  const pdfActions = useBudgetPdfActions({
    userId: session?.user.idUsers || "",
    budgetId: editing?.idBudgets,
    budgetNumber: form.budgetNumber,
    onFrozen: (pdf) => {
      setPdfFrozenAt(pdf.frozenAt);
    },
  });

  async function handleSave(values: BudgetFormValues) {
    if (isNonDraftLocked) {
      return;
    }

    const result = submit(values);

    if (!result.success || !result.payload) {
      showError(
        budgetUiCopy.errors.invalidFormData,
        (result.errors || [budgetUiCopy.errors.invalidFormData]).join("\n"),
      );
      return;
    }

    await save(result.payload, editing);
    navigate(budgetRoutePaths.list);
  }

  async function handlePreview() {
    const result = submit(form);

    if (!result.success || !result.payload) {
      showError(
        budgetUiCopy.errors.invalidFormData,
        (result.errors || [budgetUiCopy.errors.invalidFormData]).join("\n"),
      );
      return;
    }

    await pdfActions.preview(result.payload);
  }

  return (
    <ManagementPanelTemplate
      title={
        mode === "edit"
          ? budgetUiCopy.form.editTitle
          : budgetUiCopy.form.createTitle
      }
      description="Crie propostas comerciais com composição de itens e vínculo direto ao lead responsável pela oportunidade."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void handlePreview();
            }}
            loading={pdfActions.previewing}
            disabled={saving || !session?.user.idUsers}
          >
            Preview PDF
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void pdfActions.freeze();
            }}
            loading={pdfActions.freezing}
            disabled={
              saving ||
              !pdfActions.canFreezeOrDownload ||
              !session?.user.idUsers
            }
          >
            Congelar PDF
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void pdfActions.downloadOfficial();
            }}
            loading={pdfActions.downloading}
            disabled={
              saving ||
              !pdfActions.canFreezeOrDownload ||
              !session?.user.idUsers
            }
          >
            Baixar oficial
          </Button>
        </div>
      }
    >
      <GenericForm<BudgetFormValues>
        fields={getBudgetFormFields(form, {
          isEditing: mode === "edit",
          leads,
          disableAll: isNonDraftLocked,
        })}
        values={form}
        setValues={setForm}
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave(form);
        }}
        errors={errors}
        saving={saving}
        submitDisabled={isNonDraftLocked}
        onCancel={() => navigate(budgetRoutePaths.list)}
      >
        {isNonDraftLocked ? (
          <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
              Edição bloqueada
            </p>
            <p className="mt-1 text-sm text-amber-900">
              {budgetUiCopy.form.notices.nonDraftLocked}
            </p>
          </div>
        ) : null}

        {editing ? (
          <div className="mb-4 rounded-xl border border-[#e8d5c9] bg-[#faf6f2] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
              PDF oficial
            </p>
            <p className="mt-1 text-sm text-[#2c1810]">
              {pdfFrozenAt
                ? `Congelado em ${formatDateTimeDisplay(pdfFrozenAt)}`
                : "Ainda não congelado"}
            </p>
          </div>
        ) : null}

        <div className="mb-6 rounded-2xl border border-[#e8d5c9] bg-[#faf6f2] p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#7a4430]">
              {budgetUiCopy.form.labels.eventDates}
            </h3>
            <p className="mt-1 text-sm text-[#7a4430]">
              Defina as datas reais do evento conforme o período selecionado.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {buildEventDates(
              form.eventDateMode === "multiple"
                ? Number(form.eventDaysCount)
                : 1,
              form.eventDates,
            ).map((eventDate: string, index: number) => (
              <Input
                key={`event-date-${index}`}
                label={`Data ${index + 1} *`}
                type="date"
                value={eventDate}
                disabled={isNonDraftLocked}
                onChange={(event) => {
                  const nextEventDates = [...form.eventDates];
                  nextEventDates[index] = event.target.value;
                  setForm({
                    ...form,
                    eventDates: nextEventDates,
                  });
                }}
                error={index === 0 ? errors.eventDates : undefined}
              />
            ))}
          </div>
        </div>

        <BudgetItemsEditor
          items={form.items}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onUpdateItem={updateItem}
          disabled={isNonDraftLocked}
        />

        <div className="mt-6 grid gap-3 rounded-2xl border border-[#e8d5c9] bg-[#faf6f2] p-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
              {budgetUiCopy.form.summary.subtotal}
            </p>
            <p className="mt-1 text-lg font-bold text-[#2c1810]">
              {formatCurrency(totals.subtotal)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
              {budgetUiCopy.form.summary.total}
            </p>
            <p className="mt-1 text-lg font-bold text-[#2c1810]">
              {formatCurrency(totals.total)}
            </p>
          </div>
        </div>
      </GenericForm>
    </ManagementPanelTemplate>
  );
}
