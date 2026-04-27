import Button from "@/components/atoms/Button";
import ConfirmDialog from "@/components/molecules/ConfirmDialog";
import GenericForm from "@/components/organisms/GenericForm";
import Input from "@/components/atoms/Input";
import ManagementPanelTemplate from "@/components/templates/management/ManagementPanelTemplate";
import {
  budgetUiCopy,
  getBudgetFormFields,
  buildEventDates,
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
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { updateBudget } from "@/api/budgets/methods";
import { getHttpErrorMessage } from "@/api/shared/http-error";
import {
  FileText,
  MessageCircle,
  Mail,
  RotateCcw,
  FileSignature,
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

  const [emailSent, setEmailSent] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmContract, setConfirmContract] = useState(false);
  const [confirmSendEmail, setConfirmSendEmail] = useState(false);

  const isNonDraftLocked =
    mode === "edit" && Boolean(editing && editing.status !== "draft");
  const isGenerated = editing?.status === "generated";
  const isSent = editing?.status === "sent";
  const isSentByAny =
    isNonDraftLocked &&
    (editing?.sentVia === "email" || editing?.sentVia === "whatsapp");

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
    onEmailSent: () => {
      setEmailSent(true);
    },
  });

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
      await updateBudget(
        editing.idBudgets,
        { status: "sent", sentVia: "whatsapp", sentAt: now },
        session?.user.idUsers || "",
      );
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
      await updateBudget(
        editing.idBudgets,
        { sentVia: "email", sentAt: now },
        session?.user.idUsers || "",
      );
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
      await updateBudget(
        editing.idBudgets,
        { status: "generated" },
        session?.user.idUsers || "",
      );
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
      await updateBudget(
        editing.idBudgets,
        { status: "draft" },
        session?.user.idUsers || "",
      );
      updateLocalStatus("draft", { sentVia: undefined, sentAt: undefined });
      setEmailSent(false);
      showSuccess("Orçamento voltou para Rascunho");
    } catch (error) {
      const message = getHttpErrorMessage(error, "Erro ao reverter status");
      showError("Erro ao reverter para rascunho", message);
    }
  }

  async function handleApproveBudget() {
    if (!editing?.idBudgets) return;

    try {
      await updateBudget(
        editing.idBudgets,
        { status: "approved" },
        session?.user.idUsers || "",
      );
      updateLocalStatus("approved");
      showSuccess("Orçamento aprovado com sucesso");
    } catch (error) {
      const message = getHttpErrorMessage(error, "Erro ao aprovar orçamento");
      showError("Erro ao aprovar orçamento", message);
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
                {new Intl.DateTimeFormat("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(editing.sentAt))}
              </span>
            </p>
          </div>
        ) : null}
      </div>
    ) : null;

  return (
    <>
      <ManagementPanelTemplate
        title={
          mode === "edit"
            ? budgetUiCopy.form.editTitle
            : budgetUiCopy.form.createTitle
        }
        description="Crie propostas comerciais com composição de itens e vínculo direto ao lead responsável pela oportunidade."
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
        <div className="flex justify-center mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => {
                void handlePreview();
              }}
              disabled={
                saving || !session?.user.idUsers || pdfActions.previewing
              }
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#f5ede8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Visualizar prévia do orçamento"
            >
              <FileText size={32} className="text-[#C9A227]" />
              <span className="text-xs font-semibold text-center text-[#2C1810]">
                {pdfActions.previewing ? "Carregando..." : "Preview"}
              </span>
            </button>

            {!isNonDraftLocked && editing?.idBudgets ? (
              <button
                type="button"
                onClick={() => {
                  void handleGenerateBudget();
                }}
                disabled={
                  saving ||
                  !editing?.idBudgets ||
                  isSelectedLeadInactive ||
                  !isFormReadyToSend ||
                  !session?.user.idUsers
                }
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#f5ede8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={
                  isSelectedLeadInactive
                    ? "Nao e possivel gerar para lead inativo"
                    : !isFormReadyToSend
                      ? "Preencha todos os campos obrigatórios para gerar"
                      : "Gerar orçamento"
                }
              >
                <FileSignature size={32} className="text-[#C9A227]" />
                <span className="text-xs font-semibold text-center text-[#2C1810]">
                  Gerar
                </span>
              </button>
            ) : null}

            {editing?.status === "approved" ? (
              <button
                type="button"
                onClick={() => setConfirmContract(true)}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#f5ede8] transition-colors"
                title="Gerar contrato"
              >
                <FileSignature size={32} className="text-[#C9A227]" />
                <span className="text-xs font-semibold text-center text-[#2C1810]">
                  Contrato
                </span>
              </button>
            ) : null}

            {isNonDraftLocked && isGenerated && !emailSent ? (
              <button
                type="button"
                onClick={() => {
                  setConfirmSendEmail(true);
                }}
                disabled={
                  saving ||
                  !editing?.idBudgets ||
                  !leadHasEmail ||
                  !session?.user.idUsers ||
                  pdfActions.sendingEmail
                }
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#f5ede8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={
                  !leadHasEmail
                    ? "O lead selecionado não possui e-mail cadastrado"
                    : "Enviar por e-mail"
                }
              >
                <Mail size={32} className="text-[#C9A227]" />
                <span className="text-xs font-semibold text-center text-[#2C1810]">
                  {pdfActions.sendingEmail ? "Enviando" : "Email"}
                </span>
              </button>
            ) : null}

            {isNonDraftLocked ? (
              <button
                type="button"
                onClick={() => {
                  void handleSendWhatsApp();
                }}
                disabled={
                  saving ||
                  !editing?.idBudgets ||
                  !leadHasPhone ||
                  !session?.user.idUsers ||
                  pdfActions.sharingWhatsApp
                }
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#f5ede8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={
                  !leadHasPhone
                    ? "O lead selecionado não possui telefone cadastrado"
                    : "Enviar por WhatsApp"
                }
              >
                <MessageCircle size={32} className="text-[#C9A227]" />
                <span className="text-xs font-semibold text-center text-[#2C1810]">
                  {pdfActions.sharingWhatsApp ? "Enviando" : "WhatsApp"}
                </span>
              </button>
            ) : null}

            {/* Aprovar orçamento */}
            {isSentByAny && editing?.status !== "approved" ? (
              <button
                type="button"
                onClick={() => setConfirmApprove(true)}
                disabled={saving || !session?.user.idUsers}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#f5ede8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Aprovar orçamento"
              >
                <FileSignature size={32} className="text-[#C9A227]" />
                <span className="text-xs font-semibold text-center text-[#2C1810]">
                  Aprovar
                </span>
              </button>
            ) : null}

            {/* Voltar ao Rascunho */}
            {isNonDraftLocked && (isGenerated || isSent) ? (
              <button
                type="button"
                onClick={() => {
                  void handleRevertToDraft();
                }}
                disabled={saving}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#f5ede8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Voltar ao rascunho"
              >
                <RotateCcw size={32} className="text-[#C9A227]" />
                <span className="text-xs font-semibold text-center text-[#2C1810]">
                  Voltar
                </span>
              </button>
            ) : null}
          </div>
        </div>

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

      <ConfirmDialog
        open={confirmApprove}
        variant="warning"
        title="Aprovar orçamento"
        description={
          <p>
            Ao aprovar este orçamento, ele{" "}
            <strong>não poderá mais ser editado</strong>. A partir daí será
            possível gerar o contrato com o cliente.
            <br />
            <br />
            Tem certeza que deseja aprovar?
          </p>
        }
        confirmLabel="Sim, aprovar"
        cancelLabel="Voltar"
        onConfirm={() => {
          setConfirmApprove(false);
          void handleApproveBudget();
        }}
        onCancel={() => setConfirmApprove(false)}
      />

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
          if (!editing?.idBudgets) return;
          navigate(
            `${contractRoutePaths.create}?budgetId=${encodeURIComponent(editing.idBudgets)}`,
          );
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
