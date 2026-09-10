import ActionBar, {
  type ActionBarAction,
} from "@/components/molecules/ActionBar";
import AccordionSection from "@/components/molecules/AccordionSection";
import Button from "@/components/atoms/Button";
import GenericForm from "@/components/organisms/GenericForm";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import ManagementPanelTemplate from "@/components/templates/management/ManagementPanelTemplate";
import ConfirmDialog from "@/components/molecules/ConfirmDialog";
import StatusBadge from "@/components/atoms/StatusBadge";
import {
  getBudgetStatusLabel,
  getBudgetStatusTone,
} from "@/features/budgets/model/status";
import {
  budgetUiCopy,
  buildEventDates,
  buildEventTimes,
  budgetAdvancePercentageOptions,
  budgetDurationOptions,
  budgetDiscountPercentageOptions,
  budgetPaymentMethodOptions,
  budgetFormSchema,
  normalizeBudgetFormValues,
  type BudgetFormValues,
  useBudgetForm,
  useBudgetPdfActions,
} from "@/features/budgets";
import { useAuthSession } from "@/features/auth";
import BudgetItemsEditor from "@/features/budgets/components/BudgetItemsEditor";
import { useBudgetsContext } from "@/features/budgets/context/useBudgetsContext";
import { useToast } from "@/shared/toast/useToast";
import { budgetRoutePaths, contractRoutePaths } from "@/router";
import { formatDateTimeDisplay, getSentViaLabel } from "@/utils/format";
import { useCallback, useMemo, useState, useEffect } from "react";
import { fetchContracts } from "@/features/contracts/services/contract.service";
import { fetchPositions } from "@/features/positions/services/position.service";
import { fetchSupplies } from "@/features/supplies/services/supply.service";
import type { Position } from "@/api/positions/schema";
import type { Supply } from "@/api/supplies/schema";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { updateBudget } from "@/api/budgets/methods";
import { getHttpErrorMessage } from "@/api/shared/http-error";
import {
  Copy,
  FilePlus,
  FileText,
  MessageCircle,
  Mail,
  RotateCcw,
  Save,
} from "lucide-react";

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
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const initialLeadId = searchParams.get("leadId") || undefined;
  const duplicateFromId = searchParams.get("duplicateFrom") || undefined;
  const {
    form,
    editing,
    duplicateSource,
    errors,
    setForm,
    addItem,
    addSupplyItem,
    removeItem,
    updateItem,
    totals,
    submit,
  } = useBudgetForm({
    mode,
    id,
    budgets,
    initialLeadId,
    duplicateFromId,
  });

  const [hasContract, setHasContract] = useState(false);
  const [confirmDuplicate, setConfirmDuplicate] = useState(false);
  const [openSteps, setOpenSteps] = useState({ details: true, event: true });

  const toggleStep = (step: keyof typeof openSteps) =>
    setOpenSteps((previous) => ({ ...previous, [step]: !previous[step] }));

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

    void fetchSupplies({ page: 1, limit: 200 })
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setSupplies(result.items);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setSupplies([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Items created through the public budget link have no idPositions —
   * they only carry a description, which BudgetFormValues then infers a
   * serviceType label from. The "Tipo de serviço" select here binds to a
   * real position id, though, so an item stuck with an inferred label but
   * no id renders as unselected. Once positions are loaded, resolve that
   * id by matching the inferred label against an active position's name.
   */
  useEffect(() => {
    if (!positions.length || !form.items.length) {
      return;
    }

    const needsReconciliation = form.items.some(
      (item) => !item.idPositions && item.serviceType,
    );

    if (!needsReconciliation) {
      return;
    }

    const reconciledItems = form.items.map((item) => {
      if (item.idPositions || !item.serviceType) {
        return item;
      }

      const matchedPosition = positions.find(
        (position) => position.isActive && position.name === item.serviceType,
      );

      return matchedPosition
        ? { ...item, idPositions: matchedPosition.idPositions }
        : item;
    });

    setForm({ ...form, items: reconciledItems });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions, editing?.idBudgets]);

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

    if (!(await ensureBudgetGenerated())) return;

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

    if (!(await ensureBudgetGenerated())) return;

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

  /**
   * "Gerar" used to be its own button that only flipped draft -> generated
   * and asked for nothing. It's now an invisible first step folded into
   * whichever real action (e-mail, WhatsApp, criar contrato) the user
   * clicks first from a draft budget, so there's no empty click in between.
   */
  async function ensureBudgetGenerated(): Promise<boolean> {
    if (!editing?.idBudgets) return false;

    if (isNonDraftLocked) return true;

    if (isSelectedLeadInactive) {
      showError(
        "Lead inativo",
        "Não é possível gerar um orçamento para um lead inativo. Reative o lead para continuar.",
      );
      return false;
    }

    const result = submit(form);
    if (!result.success || !result.payload) {
      showError(
        budgetUiCopy.errors.invalidFormData,
        (result.errors || [budgetUiCopy.errors.invalidFormData]).join("\n"),
      );
      return false;
    }

    try {
      await updateBudget(editing.idBudgets, { status: "generated" });
      updateLocalStatus("generated");
      return true;
    } catch (error) {
      const message = getHttpErrorMessage(error, "Erro ao gerar orçamento");
      showError("Erro ao gerar orçamento", message);
      return false;
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

    if (!(await ensureBudgetGenerated())) return;

    try {
      // Aprova o orçamento (generated -> approved) antes de seguir para o contrato
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

  const duplicateAction: ActionBarAction = {
    key: "duplicate",
    label: "Duplicar",
    icon: <Copy size={18} />,
    onClick: () => setConfirmDuplicate(true),
    disabled: saving,
    title: "Criar um novo orçamento em rascunho a partir deste",
  };

  let primaryAction: ActionBarAction | undefined;
  const secondaryActions: ActionBarAction[] = [];

  if (editing?.idBudgets) {
    secondaryActions.push(previewAction, duplicateAction);

    // Draft-but-ready and already-generated/sent are shown the same way:
    // there's no separate "Gerar" step anymore — clicking "Criar contrato",
    // e-mail or WhatsApp silently generates the budget first if it hasn't
    // been yet.
    if ((!isNonDraftLocked || isGeneratedOrSent) && !hasContract) {
      primaryAction = {
        key: "create-contract",
        label: "Criar contrato",
        icon: <FilePlus size={18} />,
        onClick: () => void handleCreateContract(),
        disabled:
          saving ||
          isSelectedLeadInactive ||
          (!isNonDraftLocked && !isFormReadyToSend),
        title: isSelectedLeadInactive
          ? "Não é possível gerar para lead inativo"
          : !isNonDraftLocked && !isFormReadyToSend
            ? "Preencha todos os campos obrigatórios para continuar"
            : "Criar contrato a partir deste orçamento",
      };
      secondaryActions.push({
        key: "email",
        label: pdfActions.sendingEmail ? "Enviando..." : "Enviar por e-mail",
        icon: <Mail size={18} />,
        onClick: () => void handleSendEmail(),
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
    editing?.sentAt ||
    duplicateSource ? (
      <div className="space-y-4">
        {duplicateSource ? (
          <div className="rounded-xl border border-[#e8d5c9] bg-[#faf6f2] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
              Duplicado de {duplicateSource.budgetNumber}
            </p>
            <p className="mt-1 text-sm text-[#2c1810]">
              Os dados foram copiados do orçamento original. Revise o que
              precisar e salve para criar este novo rascunho.
            </p>
          </div>
        ) : null}

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
                {getSentViaLabel(editing.sentVia)}
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
  const eventLocationValues = buildEventTimes(
    eventDayCount,
    form.eventLocation,
  );
  const guestCountValues = buildEventTimes(eventDayCount, form.guestCount);
  const durationHoursValues = buildEventTimes(
    eventDayCount,
    form.durationHours,
  );
  const displacementFeeValues = buildEventTimes(
    eventDayCount,
    form.displacementFee,
  );
  const discountTypeValues = buildEventTimes(eventDayCount, form.discountType);
  const discountPercentageValues = buildEventTimes(
    eventDayCount,
    form.discountPercentage,
  );
  const discountAmountValues = buildEventTimes(
    eventDayCount,
    form.discountAmount,
  );
  const showDisplacementSummary = totals.displacementFee > 0;
  const showDiscountSummary =
    discountTypeValues.some((type) => type) || totals.discountAmount > 0;
  const summaryGridColumnsClass =
    showDisplacementSummary && showDiscountSummary
      ? "md:grid-cols-4"
      : showDisplacementSummary || showDiscountSummary
        ? "md:grid-cols-3"
        : "md:grid-cols-2";

  const visibleLeads = leads.filter(
    (lead) => lead.isActive || lead.idLeads === editing?.idLeads,
  );
  const leadOptions = [
    { value: "", label: budgetUiCopy.form.placeholders.lead },
    ...visibleLeads.map((lead) => ({
      value: lead.idLeads,
      label: lead.isActive ? lead.name : `${lead.name} (inativo)`,
    })),
  ];

  const paymentMethodLabel = (
    option: (typeof budgetPaymentMethodOptions)[number],
  ) =>
    option === "PIX"
      ? budgetUiCopy.form.paymentMethodOptions.pix
      : option === "Boleto"
        ? budgetUiCopy.form.paymentMethodOptions.boleto
        : option === "Cartão de Crédito"
          ? budgetUiCopy.form.paymentMethodOptions.creditCard
          : option === "Cartão de Débito"
            ? budgetUiCopy.form.paymentMethodOptions.debitCard
            : option === "Transferência Bancária"
              ? budgetUiCopy.form.paymentMethodOptions.bankTransfer
              : budgetUiCopy.form.paymentMethodOptions.cash;

  const detailsHasError = Boolean(
    errors.idLeads ||
    errors.issueDate ||
    errors.validUntil ||
    errors.paymentMethod ||
    errors.advancePercentage,
  );
  const eventHasError = Boolean(
    errors.eventDates ||
    errors.eventArrivalTimes ||
    errors.eventDepartureTimes ||
    errors.eventLocation ||
    errors.guestCount ||
    errors.durationHours ||
    errors.items ||
    errors.displacementFee ||
    errors.discountType ||
    errors.discountPercentage ||
    errors.discountAmount,
  );

  return (
    <ManagementPanelTemplate
      title={
        mode === "edit"
          ? budgetUiCopy.form.editTitle
          : budgetUiCopy.form.createTitle
      }
      description="Crie propostas comerciais com composição de itens e vínculo direto ao lead responsável pela oportunidade."
      badge={
        <StatusBadge
          label={getBudgetStatusLabel(form.status)}
          tone={getBudgetStatusTone(form.status)}
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
        fields={[]}
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
        <div className="flex flex-col gap-4">
          <AccordionSection
            title="Dados do Orçamento"
            description="Lead, prazos e condições comerciais do orçamento."
            stepNumber={1}
            hasError={detailsHasError}
            isOpen={openSteps.details}
            onToggle={() => toggleStep("details")}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {mode === "edit" ? (
                <>
                  <Input
                    label={budgetUiCopy.form.labels.budgetNumber}
                    value={form.budgetNumber}
                    readOnly
                    disabled
                  />
                  <Input
                    label="Criado em"
                    value={form.createdAt}
                    readOnly
                    disabled
                  />
                </>
              ) : null}

              <div className="md:col-span-2">
                <Select
                  label={`${budgetUiCopy.form.labels.lead} *`}
                  value={form.idLeads}
                  disabled={isNonDraftLocked}
                  onChange={(event) =>
                    setForm({ ...form, idLeads: event.target.value })
                  }
                  error={errors.idLeads}
                >
                  {leadOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              {formGuidanceContent ? (
                <div className="md:col-span-2">{formGuidanceContent}</div>
              ) : null}

              <Input
                label={`${budgetUiCopy.form.labels.issueDate} *`}
                type="date"
                value={form.issueDate}
                disabled={isNonDraftLocked}
                onChange={(event) =>
                  setForm({ ...form, issueDate: event.target.value })
                }
                error={errors.issueDate}
              />
              <Input
                label={`${budgetUiCopy.form.labels.validUntil} *`}
                type="date"
                value={form.validUntil}
                disabled={isNonDraftLocked}
                onChange={(event) =>
                  setForm({ ...form, validUntil: event.target.value })
                }
                error={errors.validUntil}
              />
              <Select
                label={`${budgetUiCopy.form.labels.eventDateMode} *`}
                value={form.eventDateMode}
                disabled={isNonDraftLocked}
                onChange={(event) =>
                  setForm({
                    ...form,
                    eventDateMode: event.target
                      .value as BudgetFormValues["eventDateMode"],
                  })
                }
              >
                <option value="single">
                  {budgetUiCopy.form.options.singleDay}
                </option>
                <option value="multiple">
                  {budgetUiCopy.form.options.multipleDays}
                </option>
              </Select>
              {form.eventDateMode === "multiple" ? (
                <Select
                  label={`${budgetUiCopy.form.labels.eventDaysCount} *`}
                  value={form.eventDaysCount}
                  disabled={isNonDraftLocked}
                  onChange={(event) =>
                    setForm({ ...form, eventDaysCount: event.target.value })
                  }
                >
                  {Array.from({ length: 9 }, (_, index) => (
                    <option key={index} value={String(index + 2)}>
                      {index + 2} dias
                    </option>
                  ))}
                </Select>
              ) : null}
              <Select
                label={`${budgetUiCopy.form.labels.paymentMethod} *`}
                value={form.paymentMethod}
                disabled={isNonDraftLocked}
                onChange={(event) =>
                  setForm({ ...form, paymentMethod: event.target.value })
                }
                error={errors.paymentMethod}
              >
                <option value="">Selecione a forma de pagamento</option>
                {budgetPaymentMethodOptions.map((option) => (
                  <option key={option} value={option}>
                    {paymentMethodLabel(option)}
                  </option>
                ))}
              </Select>
              <Select
                label={`${budgetUiCopy.form.labels.advancePercentage} *`}
                value={form.advancePercentage}
                disabled={isNonDraftLocked}
                onChange={(event) =>
                  setForm({ ...form, advancePercentage: event.target.value })
                }
                error={errors.advancePercentage}
              >
                <option value="">Sem entrada</option>
                {budgetAdvancePercentageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </AccordionSection>

          <AccordionSection
            title="Datas, Local e Serviços do Evento"
            description="Defina as datas reais do evento, local, convidados, serviços, deslocamento e desconto de cada dia."
            stepNumber={2}
            hasError={eventHasError}
            isOpen={openSteps.event}
            onToggle={() => toggleStep("event")}
          >
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
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Input
                      label={`Local do Evento ${index + 1} *`}
                      value={eventLocationValues[index] || ""}
                      disabled={isNonDraftLocked}
                      placeholder={budgetUiCopy.form.placeholders.eventLocation}
                      onChange={(event) => {
                        const nextEventLocations = [...eventLocationValues];
                        nextEventLocations[index] = event.target.value;
                        setForm({ ...form, eventLocation: nextEventLocations });
                      }}
                      error={index === 0 ? errors.eventLocation : undefined}
                    />
                    <Input
                      label={`Convidados ${index + 1} *`}
                      inputMode="numeric"
                      value={guestCountValues[index] || ""}
                      disabled={isNonDraftLocked}
                      placeholder={budgetUiCopy.form.placeholders.guestCount}
                      onChange={(event) => {
                        const nextGuestCounts = [...guestCountValues];
                        nextGuestCounts[index] = event.target.value;
                        setForm({ ...form, guestCount: nextGuestCounts });
                      }}
                      error={index === 0 ? errors.guestCount : undefined}
                    />
                    <Select
                      label={`Duração ${index + 1} *`}
                      value={durationHoursValues[index] || ""}
                      disabled={isNonDraftLocked}
                      onChange={(event) => {
                        const nextDurationHours = [...durationHoursValues];
                        nextDurationHours[index] = event.target.value;
                        setForm({ ...form, durationHours: nextDurationHours });
                      }}
                      error={index === 0 ? errors.durationHours : undefined}
                    >
                      <option value="">Selecione a duração</option>
                      {budgetDurationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="mt-4">
                    {(() => {
                      const dayItems = form.items
                        .map((item, itemIndex) => ({ item, itemIndex }))
                        .filter(
                          ({ item }) => (item.eventDateIndex ?? 0) === index,
                        );

                      return (
                        <BudgetItemsEditor
                          items={dayItems.map(({ item }) => item)}
                          positions={positions}
                          supplies={supplies}
                          onAddItem={() => addItem(index)}
                          onAddSupplyItem={() => addSupplyItem(index)}
                          onRemoveItem={(localIndex) =>
                            removeItem(dayItems[localIndex].itemIndex)
                          }
                          onUpdateItem={(localIndex, patch) =>
                            updateItem(dayItems[localIndex].itemIndex, patch)
                          }
                          disabled={isNonDraftLocked}
                          title={
                            eventDayCount > 1
                              ? `Serviços — Dia ${index + 1}`
                              : budgetUiCopy.form.labels.items
                          }
                        />
                      );
                    })()}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Input
                      label={`${budgetUiCopy.form.labels.displacementFee} ${index + 1} *`}
                      value={displacementFeeValues[index] || ""}
                      disabled={isNonDraftLocked}
                      placeholder="R$ 0,00"
                      inputMode="decimal"
                      onChange={(event) => {
                        const next = [...displacementFeeValues];
                        next[index] = event.target.value;
                        setForm({ ...form, displacementFee: next });
                      }}
                      error={index === 0 ? errors.displacementFee : undefined}
                    />
                    <Select
                      label={`Tipo de Desconto ${index + 1}`}
                      value={discountTypeValues[index] || ""}
                      disabled={isNonDraftLocked}
                      onChange={(event) => {
                        const next = [...discountTypeValues];
                        next[index] = event.target.value;
                        setForm({
                          ...form,
                          discountType:
                            next as BudgetFormValues["discountType"],
                        });
                      }}
                      error={index === 0 ? errors.discountType : undefined}
                    >
                      <option value="">Sem desconto</option>
                      <option value="percentage">Desconto (%)</option>
                      <option value="amount">Desconto (R$)</option>
                    </Select>
                    {discountTypeValues[index] === "percentage" ? (
                      <Select
                        label={`Desconto (%) ${index + 1} *`}
                        value={discountPercentageValues[index] || ""}
                        disabled={isNonDraftLocked}
                        onChange={(event) => {
                          const next = [...discountPercentageValues];
                          next[index] = event.target.value;
                          setForm({ ...form, discountPercentage: next });
                        }}
                        error={
                          index === 0 ? errors.discountPercentage : undefined
                        }
                      >
                        <option value="">Selecione o desconto</option>
                        {budgetDiscountPercentageOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    ) : discountTypeValues[index] === "amount" ? (
                      <Input
                        label={`Desconto (R$) ${index + 1} *`}
                        value={discountAmountValues[index] || ""}
                        disabled={isNonDraftLocked}
                        placeholder="Ex: R$ 150,00"
                        inputMode="numeric"
                        onChange={(event) => {
                          const next = [...discountAmountValues];
                          next[index] = event.target.value;
                          setForm({ ...form, discountAmount: next });
                        }}
                        error={index === 0 ? errors.discountAmount : undefined}
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </AccordionSection>
        </div>

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
      </GenericForm>

      <ConfirmDialog
        open={confirmDuplicate}
        title="Duplicar orçamento"
        description="Criar um novo orçamento (rascunho) a partir deste? Os dados serão copiados e você poderá ajustá-los antes de salvar."
        confirmLabel="Duplicar"
        onCancel={() => setConfirmDuplicate(false)}
        onConfirm={() => {
          setConfirmDuplicate(false);
          if (editing?.idBudgets) {
            navigate(
              `${budgetRoutePaths.create}?duplicateFrom=${editing.idBudgets}`,
            );
          }
        }}
      />
    </ManagementPanelTemplate>
  );
}
