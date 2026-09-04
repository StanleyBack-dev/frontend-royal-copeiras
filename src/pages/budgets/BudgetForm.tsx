import ActionBar, {
  type ActionBarAction,
} from "@/components/molecules/ActionBar";
import Button from "@/components/atoms/Button";
import ConfirmDialog from "@/components/molecules/ConfirmDialog";
import GenericForm from "@/components/organisms/GenericForm";
import Input from "@/components/atoms/Input";
import ManagementPanelTemplate from "@/components/templates/management/ManagementPanelTemplate";
import StatusBadge, {
  type StatusBadgeTone,
} from "@/components/atoms/StatusBadge";
import {
  budgetUiCopy,
  getBudgetFormFields,
  buildEventDates,
  buildEventTimes,
  budgetFormSchema,
  normalizeBudgetFormValues,
  type BudgetFormValues,
  useBudgetForm,
  useBudgetPdfActions,
} from "@/features/budgets";
import { useAuthSession } from "@/features/auth";
import BudgetItemsEditor from "@/features/budgets/components/BudgetItemsEditor";
import BudgetDisplacementFeeCard from "@/features/budgets/components/BudgetDisplacementFeeCard";
import { useBudgetsContext } from "@/features/budgets/context/useBudgetsContext";
import { useToast } from "@/shared/toast/useToast";
import { budgetRoutePaths, contractRoutePaths } from "@/router";
import { formatDateTimeDisplay } from "@/utils/format";
import { useCallback, useMemo, useState, useEffect } from "react";
import { fetchContracts } from "@/features/contracts/services/contract.service";
import { fetchPositions } from "@/features/positions/services/position.service";
import type { Position } from "@/api/positions/schema";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { updateBudget } from "@/api/budgets/methods";
import { getHttpErrorMessage } from "@/api/shared/http-error";
import {
  FilePlus,
  FileText,
  MessageCircle,
  Mail,
  RotateCcw,
  FileSignature,
  Save,
} from "lucide-react";

const BUDGET_STATUS_TONES: Record<string, StatusBadgeTone> = {
  draft: "neutral",
  generated: "warning",
  sent: "warning",
  approved: "success",
  rejected: "danger",
  expired: "danger",
  canceled: "danger",
};

function getBudgetStatusMeta(status: string) {
  return {
    label:
      budgetUiCopy.form.options[
        status as keyof typeof budgetUiCopy.form.options
      ] || status,
    tone: BUDGET_STATUS_TONES[status] || "neutral",
  };
}

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
  const { budgets, leads, save, saving, setBudgets } = useBudgetsContext();
  const { showError, showSuccess } = useToast();
  const { session } = useAuthSession();
  const [positions, setPositions] = useState<Position[]>([]);
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

  const [confirmContract, setConfirmContract] = useState(false);
  const [confirmSendEmail, setConfirmSendEmail] = useState(false);
  const [hasContract, setHasContract] = useState(false);

  const isNonDraftLocked =
    mode === "edit" && Boolean(editing && editing.status !== "draft");
  const isGenerated = editing?.status === "generated";
  const isSent = editing?.status === "sent";
  const isGeneratedOrSent = isGenerated || isSent;

  const selectedLead = leads.find((l) => l.idLeads === form.idLeads) ?? null;
  const isSelectedLeadInactive = selectedLead?.isActive === false;
  const isChangingToInactiveLead = Boolean(
    editing && form.idLeads !== editing.idLeads && isSelectedLeadInactive,
  );
  const leadHasEmail = Boolean(selectedLead?.email);
  const leadHasPhone = Boolean(selectedLead?.phone);
  const sendValidation = useMemo(
    () => budgetFormSchema.safeParse(normalizeBudgetFormValues(form)),
    [form],
  );
  const isFormReadyToSend = sendValidation.success;
  const sendPendingMessages = useMemo(() => {
    if (sendValidation.success) {
      return [];
    }

    return Array.from(
      new Set(sendValidation.error.issues.map((issue) => issue.message)),
    );
  }, [sendValidation]);

  const updateLocalStatus = useCallback(
    (status: string, extra?: { sentVia?: string; sentAt?: string }) => {
      if (!editing) return;
      setBudgets((prev) =>
        prev.map((b) =>
          b.idBudgets === editing.idBudgets
            ? { ...b, status: status as never, ...extra }
            : b,
        ),
      );
    },
    [editing, setBudgets],
  );

  const pdfActions = useBudgetPdfActions({
    userId: session?.user.idUsers || "",
    budgetId: editing?.idBudgets,
    budgetNumber: form.budgetNumber,
    onEmailSent: () => {},
  });

  useEffect(() => {
    let cancelled = false;

    async function checkContract() {
      if (!editing?.idBudgets || !session?.user.idUsers)
        return setHasContract(false);

      try {
        const result = await fetchContracts({
          page: 1,
          limit: 1,
          idBudgets: editing.idBudgets,
        });
        if (!cancelled) setHasContract(result.items.length > 0);
      } catch {
        if (!cancelled) setHasContract(false);
      }
    }

    void checkContract();

    return () => {
      cancelled = true;
    };
  }, [editing?.idBudgets, session?.user.idUsers]);

  useEffect(() => {
    let isMounted = true;

    void fetchPositions({ page: 1, limit: 100 })
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setPositions(result.items);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setPositions([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSave(values: BudgetFormValues) {
    if (isNonDraftLocked) return;

    if (
      (mode === "create" || isChangingToInactiveLead) &&
      isSelectedLeadInactive
    ) {
      showError(
        "Lead inativo",
        "Não é possível salvar um orçamento para um lead inativo. Reative o lead ou selecione outro lead.",
      );
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

    const savedBudget = await save(result.payload, editing);
    if (!savedBudget) {
      return;
    }

    if (mode === "create") {
      setBudgets((previous) => {
        const filtered = previous.filter(
          (budget) => budget.idBudgets !== savedBudget.idBudgets,
        );

        return [savedBudget, ...filtered];
      });

      navigate(budgetRoutePaths.edit(savedBudget.idBudgets), {
        replace: true,
      });
    }
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

  async function handleSendWhatsApp() {
    if (!editing || !selectedLead?.phone || !selectedLead?.name) return;

    const result = submit(form);
    if (!result.success || !result.payload) {
      showError(
        budgetUiCopy.errors.invalidFormData,
        (result.errors || [budgetUiCopy.errors.invalidFormData]).join("\n"),
      );
      return;
    }

    const outcome = await pdfActions.shareWhatsApp(
      selectedLead.name,
      selectedLead.phone,
    );

    if (outcome === null) return;
    // Orcamento mantem status "generated" para continuar permitindo envios
    const now = new Date().toISOString();
    try {
      await updateBudget(editing.idBudgets, {
        status: "sent",
        sentVia: "whatsapp",
        sentAt: now,
      });
    } catch {
      // ignora erro de persistencia, estado local ja foi atualizado
    }
    updateLocalStatus("sent", {
      sentVia: "whatsapp",
      sentAt: now,
    });
  }

  async function handleSendEmail() {
    if (!editing?.idBudgets) return;

    const result = submit(form);
    if (!result.success || !result.payload) {
      showError(
        budgetUiCopy.errors.invalidFormData,
        (result.errors || [budgetUiCopy.errors.invalidFormData]).join("\n"),
      );
      return;
    }

    const sent = await pdfActions.sendEmail();
    if (!sent) {
      return;
    }

    const now = new Date().toISOString();
    try {
      await updateBudget(editing.idBudgets, {
        sentVia: "email",
        sentAt: now,
      });
    } catch {
      // ignora erro de persistencia, estado local ja foi atualizado
    }
    updateLocalStatus("sent", {
      sentVia: "email",
      sentAt: now,
    });
  }

  async function handleGenerateBudget() {
    if (!editing?.idBudgets) return;

    if (isSelectedLeadInactive) {
      showError(
        "Lead inativo",
        "Não é possível gerar um orçamento para um lead inativo. Reative o lead para continuar.",
      );
      return;
    }

    const result = submit(form);
    if (!result.success || !result.payload) {
      showError(
        budgetUiCopy.errors.invalidFormData,
        (result.errors || [budgetUiCopy.errors.invalidFormData]).join("\n"),
      );
      return;
    }

    try {
      await updateBudget(editing.idBudgets, { status: "generated" });
      updateLocalStatus("generated");
      showSuccess("Orçamento gerado com sucesso");
    } catch (error) {
      const message = getHttpErrorMessage(error, "Erro ao gerar orçamento");
      showError("Erro ao gerar orçamento", message);
    }
  }

  async function handleRevertToDraft() {
    if (!editing) return;

    try {
      await updateBudget(editing.idBudgets, { status: "draft" });
      updateLocalStatus("draft", { sentVia: undefined, sentAt: undefined });
      showSuccess("Orçamento voltou para Rascunho");
    } catch (error) {
      const message = getHttpErrorMessage(error, "Erro ao reverter status");
      showError("Erro ao reverter para rascunho", message);
    }
  }

  async function handleCreateContract() {
    if (!editing?.idBudgets) return;

    try {
      // Primeiro, atualiza o status do orçamento para "approved"
      await updateBudget(editing.idBudgets, { status: "approved" });
      updateLocalStatus("approved");

      // Depois navega para o formulário de contratos
      navigate(
        `${contractRoutePaths.create}?budgetId=${encodeURIComponent(editing.idBudgets)}`,
      );
    } catch (error) {
      const message = getHttpErrorMessage(error, "Erro ao criar contrato");
      showError("Erro ao criar contrato", message);
    }
  }

  const previewAction: ActionBarAction = {
    key: "preview",
    label: pdfActions.previewing ? "Carregando..." : "Preview",
    icon: <FileText size={18} />,
    onClick: () => void handlePreview(),
    disabled: saving || !session?.user.idUsers || pdfActions.previewing,
    title: "Visualizar prévia do orçamento",
  };

  let primaryAction: ActionBarAction | undefined;
  const secondaryActions: ActionBarAction[] = [];

  if (editing?.idBudgets) {
    secondaryActions.push(previewAction);

    if (!isNonDraftLocked) {
      primaryAction = {
        key: "generate",
        label: "Gerar orçamento",
        icon: <FileSignature size={18} />,
        onClick: () => void handleGenerateBudget(),
        disabled:
          saving ||
          isSelectedLeadInactive ||
          !isFormReadyToSend ||
          !session?.user.idUsers,
        title: isSelectedLeadInactive
          ? "Não é possível gerar para lead inativo"
          : !isFormReadyToSend
            ? "Preencha todos os campos obrigatórios para gerar"
            : "Gerar orçamento",
      };
    } else if (isGeneratedOrSent && !hasContract) {
      primaryAction = {
        key: "create-contract",
        label: "Criar contrato",
        icon: <FilePlus size={18} />,
        onClick: () => setConfirmContract(true),
        disabled: saving,
        title: "Criar contrato a partir deste orçamento",
      };
      secondaryActions.push({
        key: "email",
        label: pdfActions.sendingEmail ? "Enviando..." : "Enviar por e-mail",
        icon: <Mail size={18} />,
        onClick: () => setConfirmSendEmail(true),
        disabled:
          saving ||
          !leadHasEmail ||
          !session?.user.idUsers ||
          pdfActions.sendingEmail,
        title: !leadHasEmail
          ? "O lead selecionado não possui e-mail cadastrado"
          : "Enviar por e-mail",
      });
      secondaryActions.push({
        key: "whatsapp",
        label: pdfActions.sharingWhatsApp ? "Enviando..." : "WhatsApp",
        icon: <MessageCircle size={18} />,
        onClick: () => void handleSendWhatsApp(),
        disabled:
          saving ||
          !leadHasPhone ||
          !session?.user.idUsers ||
          pdfActions.sharingWhatsApp,
        title: !leadHasPhone
          ? "O lead selecionado não possui telefone cadastrado"
          : "Enviar por WhatsApp",
      });
    }

    if (isNonDraftLocked && !hasContract) {
      secondaryActions.push({
        key: "revert-to-draft",
        label: "Voltar ao rascunho",
        icon: <RotateCcw size={18} />,
        onClick: () => void handleRevertToDraft(),
        disabled: saving,
        title: "Voltar ao rascunho",
      });
    }
  }

  const formGuidanceContent =
    isSelectedLeadInactive ||
    isNonDraftLocked ||
    (!isFormReadyToSend && editing?.idBudgets) ||
    editing?.sentAt ? (
      <div className="space-y-4">
        {isSelectedLeadInactive ? (
          <div className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
              Lead inativo
            </p>
            <p className="mt-1 text-sm text-rose-900">
              Nao e possivel criar ou gerar orcamento para lead inativo. Reative
              o lead ou selecione outro lead ativo.
            </p>
          </div>
        ) : null}

        {isNonDraftLocked ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
              Edição bloqueada
            </p>
            <p className="mt-1 text-sm text-amber-900">
              {budgetUiCopy.form.notices.nonDraftLocked}
            </p>
          </div>
        ) : null}

        {!isNonDraftLocked && editing?.idBudgets && !isFormReadyToSend ? (
          <div className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
              Geração bloqueada
            </p>
            <p className="mt-1 text-sm text-rose-900">
              Preencha os campos obrigatórios para liberar o botão de gerar
              orçamento.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-rose-900">
              {sendPendingMessages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {editing?.sentAt ? (
          <div className="rounded-xl border border-[#e8d5c9] bg-[#faf6f2] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
              Envio registrado
            </p>
            <p className="mt-1 text-sm text-[#2c1810]">
              Enviado via{" "}
              <span className="font-semibold">
                {editing.sentVia === "email"
                  ? "E-mail"
                  : editing.sentVia === "whatsapp"
                    ? "WhatsApp"
                    : editing.sentVia}
              </span>{" "}
              em{" "}
              <span className="font-semibold">
                {formatDateTimeDisplay(editing.sentAt)}
              </span>
            </p>
          </div>
        ) : null}
      </div>
    ) : null;

  const eventDayCount =
    form.eventDateMode === "multiple" ? Number(form.eventDaysCount) : 1;
  const eventDateValues = buildEventDates(eventDayCount, form.eventDates);
  const eventArrivalTimeValues = buildEventTimes(
    eventDayCount,
    form.eventArrivalTimes,
  );
  const eventDepartureTimeValues = buildEventTimes(
    eventDayCount,
    form.eventDepartureTimes,
  );
  const showDisplacementSummary = totals.displacementFee > 0;
  const showDiscountSummary =
    Boolean(form.discountType) || totals.discountAmount > 0;
  const summaryGridColumnsClass =
    showDisplacementSummary && showDiscountSummary
      ? "md:grid-cols-4"
      : showDisplacementSummary || showDiscountSummary
        ? "md:grid-cols-3"
        : "md:grid-cols-2";

  return (
    <>
      <ManagementPanelTemplate
        title={
          mode === "edit"
            ? budgetUiCopy.form.editTitle
            : budgetUiCopy.form.createTitle
        }
        description="Crie propostas comerciais com composição de itens e vínculo direto ao lead responsável pela oportunidade."
        badge={
          <StatusBadge
            label={getBudgetStatusMeta(form.status).label}
            tone={getBudgetStatusMeta(form.status).tone}
          />
        }
        actions={
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(budgetRoutePaths.list)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              leftIcon={<Save size={16} />}
              onClick={() => void handleSave(form)}
              disabled={
                saving ||
                isNonDraftLocked ||
                (mode === "create" && isSelectedLeadInactive) ||
                isChangingToInactiveLead ||
                !session?.user.idUsers
              }
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        }
      >
        {primaryAction || secondaryActions.length > 0 ? (
          <div className="mb-6">
            <ActionBar primary={primaryAction} secondary={secondaryActions} />
          </div>
        ) : null}

        <GenericForm<BudgetFormValues>
          fields={getBudgetFormFields(form, {
            isEditing: mode === "edit",
            leads,
            disableAll: isNonDraftLocked,
            currentLeadId: editing?.idLeads,
          })}
          contentAfterFieldName={mode === "edit" ? "createdAt" : "idLeads"}
          contentAfterField={formGuidanceContent}
          values={form}
          setValues={setForm}
          onSubmit={(event) => {
            event.preventDefault();
            void handleSave(form);
          }}
          errors={errors}
          saving={saving}
          submitDisabled={
            isNonDraftLocked ||
            (mode === "create" && isSelectedLeadInactive) ||
            isChangingToInactiveLead
          }
          onCancel={() => navigate(budgetRoutePaths.list)}
        >
          <div className="mb-6 rounded-2xl border border-[#e8d5c9] bg-[#faf6f2] p-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#7a4430]">
                {budgetUiCopy.form.labels.eventDates}
              </h3>
              <p className="mt-1 text-sm text-[#7a4430]">
                Defina as datas reais do evento conforme o período selecionado.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {eventDateValues.map((eventDate: string, index: number) => (
                <div
                  key={`event-schedule-${index}`}
                  className="rounded-2xl border border-[#eadfd6] bg-white/70 p-4"
                >
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
                    Dia {index + 1}
                  </p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Input
                      label={`Data ${index + 1} *`}
                      type="date"
                      value={eventDate}
                      disabled={isNonDraftLocked}
                      onChange={(event) => {
                        const nextEventDates = [...eventDateValues];
                        nextEventDates[index] = event.target.value;
                        setForm({
                          ...form,
                          eventDates: nextEventDates,
                        });
                      }}
                      error={index === 0 ? errors.eventDates : undefined}
                    />
                    <Input
                      label={`Chegada ${index + 1} *`}
                      type="time"
                      value={eventArrivalTimeValues[index] || ""}
                      disabled={isNonDraftLocked}
                      onChange={(event) => {
                        const nextEventArrivalTimes = [
                          ...eventArrivalTimeValues,
                        ];
                        nextEventArrivalTimes[index] = event.target.value;
                        setForm({
                          ...form,
                          eventArrivalTimes: nextEventArrivalTimes,
                        });
                      }}
                      error={index === 0 ? errors.eventArrivalTimes : undefined}
                    />
                    <Input
                      label={`Partida ${index + 1} *`}
                      type="time"
                      value={eventDepartureTimeValues[index] || ""}
                      disabled={isNonDraftLocked}
                      onChange={(event) => {
                        const nextEventDepartureTimes = [
                          ...eventDepartureTimeValues,
                        ];
                        nextEventDepartureTimes[index] = event.target.value;
                        setForm({
                          ...form,
                          eventDepartureTimes: nextEventDepartureTimes,
                        });
                      }}
                      error={
                        index === 0 ? errors.eventDepartureTimes : undefined
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <BudgetDisplacementFeeCard
            value={form.displacementFee}
            onChange={(value) => setForm({ ...form, displacementFee: value })}
            error={errors.displacementFee}
            disabled={isNonDraftLocked}
          />

          <BudgetItemsEditor
            items={form.items}
            positions={positions}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onUpdateItem={updateItem}
            disabled={isNonDraftLocked}
          />

          <div
            className={`mt-6 grid gap-3 rounded-2xl border border-[#e8d5c9] bg-[#faf6f2] p-4 ${summaryGridColumnsClass}`}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
                {budgetUiCopy.form.summary.subtotal}
              </p>
              <p className="mt-1 text-lg font-bold text-[#2c1810]">
                {formatCurrency(totals.subtotal)}
              </p>
            </div>
            {showDisplacementSummary ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
                  {budgetUiCopy.form.labels.displacementFee}
                </p>
                <p className="mt-1 text-lg font-bold text-[#2c1810]">
                  {formatCurrency(totals.displacementFee)}
                </p>
              </div>
            ) : null}
            {showDiscountSummary ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
                  Desconto
                </p>
                <p className="mt-1 text-lg font-bold text-red-700">
                  -{formatCurrency(totals.discountAmount)}
                </p>
              </div>
            ) : null}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
                {budgetUiCopy.form.summary.total}
              </p>
              <p className="mt-1 text-lg font-bold text-[#2c1810]">
                {formatCurrency(totals.total)}
              </p>
            </div>
          </div>

          {form.discountType === "percentage" &&
          form.discountPercentage &&
          Number(form.discountPercentage) > 0 ? (
            <div className="mt-4 rounded-2xl border border-[#e8d5c9] bg-[#faf6f2] p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
                    Desconto ({form.discountPercentage}%)
                  </p>
                  <p className="text-sm font-semibold text-red-600">
                    -{formatCurrency(totals.discountAmount)}
                  </p>
                </div>
                <div className="border-t border-[#e8d5c9] pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
                      Total com Desconto
                    </p>
                    <p className="text-lg font-bold text-[#2c1810]">
                      {formatCurrency(totals.total)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {form.discountType === "amount" &&
          form.discountAmount &&
          Number(form.discountAmount.replace(/\D/g, "") || 0) > 0 ? (
            <div className="mt-4 rounded-2xl border border-[#e8d5c9] bg-[#faf6f2] p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
                    Desconto (Valor Fixo)
                  </p>
                  <p className="text-sm font-semibold text-red-600">
                    -{formatCurrency(totals.discountAmount)}
                  </p>
                </div>
                <div className="border-t border-[#e8d5c9] pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
                      Total com Desconto
                    </p>
                    <p className="text-lg font-bold text-[#2c1810]">
                      {formatCurrency(totals.total)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </GenericForm>
      </ManagementPanelTemplate>

      <ConfirmDialog
        open={confirmContract}
        title="Gerar contrato"
        description={
          <p>
            Você está prestes a criar um contrato baseado neste orçamento
            aprovado.
            <br />
            <br />
            Deseja continuar?
          </p>
        }
        confirmLabel="Sim, gerar contrato"
        cancelLabel="Voltar"
        onConfirm={() => {
          setConfirmContract(false);
          void handleCreateContract();
        }}
        onCancel={() => setConfirmContract(false)}
      />
      <ConfirmDialog
        open={confirmSendEmail}
        title="Enviar por e-mail"
        description={
          <p>
            Você está prestes a enviar este orçamento por e-mail para o lead
            selecionado.
            <br />
            <br />
            Deseja continuar?
          </p>
        }
        confirmLabel="Sim, enviar"
        cancelLabel="Voltar"
        onConfirm={() => {
          setConfirmSendEmail(false);
          void handleSendEmail();
        }}
        onCancel={() => setConfirmSendEmail(false)}
      />
    </>
  );
}
