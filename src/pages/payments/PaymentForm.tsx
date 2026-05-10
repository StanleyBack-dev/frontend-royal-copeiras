import Button from "@/components/atoms/Button";
import GenericForm, {
  type FormField,
} from "@/components/organisms/GenericForm";
import ManagementPanelTemplate from "@/components/templates/management/ManagementPanelTemplate";
import SectionCard from "@/components/organisms/SectionCard";
import {
  type CreatePaymentItemPayload,
  type CreatePaymentPayload,
  type Payment,
  type UpdatePaymentPayload,
} from "@/api/payments/schema";
import {
  fetchPaymentById,
  paymentValidationMessages,
  paymentUiCopy,
} from "@/features/payments";
import { fetchBudgetLeadOptions } from "@/features/budgets/services/budget.service";
import { usePaymentsContext } from "@/features/payments/context/usePaymentsContext";
import PaymentItemsEditor, {
  type PaymentItemFormValues,
} from "@/features/payments/components/PaymentItemsEditor";
import type { Lead } from "@/api/leads/schema";
import {
  parseCurrencyInput,
  formatCurrencyFromDecimal,
} from "@/features/payments/model/formatters";
import { paymentRoutePaths } from "@/router";
import { useToast } from "@/shared/toast/useToast";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type PaymentFormValues = {
  idLeads: string;
  idBudgets: string;
  idContracts: string;
  idEvents: string;
  notes: string;
};

type PaymentFormErrors = Partial<Record<keyof PaymentFormValues, string>>;

const defaultValues: PaymentFormValues = {
  idLeads: "",
  idBudgets: "",
  idContracts: "",
  idEvents: "",
  notes: "",
};

function getTodayLocalDate() {
  function padDatePart(value: number) {
    return String(value).padStart(2, "0");
  }

  function toIsoDateString(date = new Date()) {
    return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
  }

  return toIsoDateString();
}

function createDefaultPaymentItem(): PaymentItemFormValues {
  return {
    origin: "budget_advance",
    plannedAmount: "",
    status: "pendente",
    paidAmount: "",
    dueDate: "",
    paymentDate: getTodayLocalDate(),
    proofUrl: "",
    notes: "",
  };
}

function toFormDate(value?: string) {
  if (!value) {
    return "";
  }

  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
        {label}
      </p>
      <p className="mt-1 text-sm text-[#2c1810]">{value}</p>
    </div>
  );
}

export default function PaymentForm({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const paymentId = id ?? "";
  const navigate = useNavigate();
  const { showError } = useToast();
  const { payments, budgets, contracts, events, save, saving } =
    usePaymentsContext();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [values, setValues] = useState<PaymentFormValues>(defaultValues);
  const [paymentItems, setPaymentItems] = useState<PaymentItemFormValues[]>([
    createDefaultPaymentItem(),
  ]);
  const [errors, setErrors] = useState<PaymentFormErrors>({});
  const [loadingPayment, setLoadingPayment] = useState(mode === "edit");
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadLeadOptions() {
      try {
        const nextLeads = await fetchBudgetLeadOptions();

        if (!isMounted) {
          return;
        }

        setLeads(nextLeads);
      } catch (error) {
        void error;

        if (!isMounted) {
          return;
        }

        showError(
          paymentUiCopy.errors.loadCollectionFallback,
          paymentUiCopy.errors.loadCollectionFallback,
        );
      }
    }

    void loadLeadOptions();

    return () => {
      isMounted = false;
    };
  }, [showError]);

  useEffect(() => {
    if (mode !== "edit" || !paymentId) {
      return;
    }

    let isMounted = true;

    async function loadPayment() {
      setLoadingPayment(true);

      try {
        const fromContext = payments.find(
          (payment) => payment.idPayments === paymentId,
        );
        const payment = fromContext ?? (await fetchPaymentById(paymentId));

        if (!isMounted) {
          return;
        }

        setEditingPayment(payment);

        setValues({
          idLeads: payment.idLeads || "",
          idBudgets: payment.idBudgets || "",
          idContracts: payment.idContracts || "",
          idEvents: payment.idEvents || "",
          notes: payment.notes || "",
        });

        const mappedItems = (payment.paymentItems ?? []).map((item) => ({
          origin: item.origin,
          plannedAmount: formatCurrencyFromDecimal(
            Number(item.plannedAmount) || 0,
          ),
          status: item.status,
          paidAmount:
            item.paidAmount != null
              ? formatCurrencyFromDecimal(Number(item.paidAmount))
              : "",
          dueDate: toFormDate(item.dueDate),
          paymentDate: toFormDate(item.paymentDate) || getTodayLocalDate(),
          proofUrl: item.proofUrl || "",
          notes: item.notes || "",
        }));

        setPaymentItems(
          mappedItems.length > 0 ? mappedItems : [createDefaultPaymentItem()],
        );
      } catch {
        if (!isMounted) {
          return;
        }

        showError(
          paymentUiCopy.errors.loadPaymentsFallback,
          paymentUiCopy.form.notices.loadSelectedPaymentFallback,
        );
        navigate(paymentRoutePaths.list, { replace: true });
      } finally {
        if (isMounted) {
          setLoadingPayment(false);
        }
      }
    }

    void loadPayment();

    return () => {
      isMounted = false;
    };
  }, [mode, navigate, paymentId, payments, showError]);

  const budgetOptions = useMemo(() => {
    if (!values.idLeads) {
      return budgets;
    }

    return budgets.filter((budget) => budget.idLeads === values.idLeads);
  }, [budgets, values.idLeads]);

  const contractOptions = useMemo(() => {
    if (!values.idBudgets) {
      return contracts;
    }

    return contracts.filter(
      (contract) => contract.idBudgets === values.idBudgets,
    );
  }, [contracts, values.idBudgets]);

  const selectedLead = useMemo(() => {
    return leads.find((lead) => lead.idLeads === values.idLeads);
  }, [leads, values.idLeads]);

  const selectedBudget = useMemo(() => {
    return budgets.find((budget) => budget.idBudgets === values.idBudgets);
  }, [budgets, values.idBudgets]);

  const selectedContract = useMemo(() => {
    return contracts.find(
      (contract) => contract.idContracts === values.idContracts,
    );
  }, [contracts, values.idContracts]);

  const selectedEvent = useMemo(() => {
    return events.find((event) => event.idEvents === values.idEvents);
  }, [events, values.idEvents]);

  const fields = useMemo<FormField[]>(() => {
    const createFields: FormField[] = [
      {
        name: "idLeads",
        label: paymentUiCopy.form.labels.idLeads,
        as: "select",
        required: true,
        disabled: mode === "edit",
        options: [
          { value: "", label: paymentUiCopy.form.placeholders.lead },
          ...leads.map((lead) => ({ value: lead.idLeads, label: lead.name })),
        ],
      },
      {
        name: "idBudgets",
        label: paymentUiCopy.form.labels.idBudgets,
        as: "select",
        disabled: mode === "edit",
        options: [
          { value: "", label: paymentUiCopy.form.placeholders.budget },
          ...budgetOptions.map((budget) => ({
            value: budget.idBudgets,
            label: budget.budgetNumber,
          })),
        ],
      },
      {
        name: "idContracts",
        label: paymentUiCopy.form.labels.idContracts,
        as: "select",
        disabled: mode === "edit",
        options: [
          { value: "", label: paymentUiCopy.form.placeholders.contract },
          ...contractOptions.map((contract) => ({
            value: contract.idContracts,
            label: contract.contractNumber,
          })),
        ],
      },
      {
        name: "idEvents",
        label: paymentUiCopy.form.labels.idEvents,
        placeholder: paymentUiCopy.form.placeholders.event,
        disabled: mode === "edit",
      },
    ];

    // Filter out relationship fields in edit mode since they're displayed as info
    if (mode === "edit") {
      return createFields.filter(
        (field) =>
          !["idLeads", "idBudgets", "idContracts", "idEvents"].includes(
            field.name,
          ),
      );
    }

    return createFields;
  }, [budgetOptions, contractOptions, leads, mode]);

  function validateCreateForm(formValues: PaymentFormValues) {
    const nextErrors: PaymentFormErrors = {};

    if (!formValues.idLeads) {
      nextErrors.idLeads = paymentValidationMessages.leadRequired;
    }

    if (!formValues.idContracts && !formValues.idEvents) {
      nextErrors.idContracts =
        paymentValidationMessages.contractOrEventRequired;
    }

    return nextErrors;
  }

  function updatePaymentItem(
    index: number,
    patch: Partial<PaymentItemFormValues>,
  ) {
    setPaymentItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }

  function validatePaymentItemsRequired() {
    const itemsWithPlannedAmount = paymentItems.filter((item) => {
      const plannedAmount = parseCurrencyInput(item.plannedAmount);
      return plannedAmount != null && plannedAmount > 0;
    });

    if (itemsWithPlannedAmount.length === 0) {
      return paymentValidationMessages.itemsRequired;
    }

    if (itemsWithPlannedAmount.some((item) => !item.status?.trim())) {
      return paymentValidationMessages.statusRequired;
    }

    if (
      mode === "edit" &&
      itemsWithPlannedAmount.some((item) => !item.paymentDate?.trim())
    ) {
      return paymentValidationMessages.paymentDateRequired;
    }

    if (
      itemsWithPlannedAmount.some(
        (item) => parseCurrencyInput(item.paidAmount) == null,
      )
    ) {
      return paymentValidationMessages.paidAmountRequired;
    }

    if (
      itemsWithPlannedAmount.some(
        (item) =>
          ["pendente", "cancelado"].includes(item.status) &&
          (parseCurrencyInput(item.paidAmount) ?? 0) > 0,
      )
    ) {
      return paymentValidationMessages.zeroPaidAmountRequired;
    }

    if (
      itemsWithPlannedAmount.some((item) => {
        const plannedAmount = parseCurrencyInput(item.plannedAmount) ?? 0;
        const paidAmount = parseCurrencyInput(item.paidAmount) ?? 0;

        return item.status === "parcial" && paidAmount >= plannedAmount;
      })
    ) {
      return paymentValidationMessages.partialPaidAmountMustBeLowerThanPlanned;
    }

    return null;
  }

  function buildItemsPayload(): CreatePaymentItemPayload[] {
    return paymentItems.reduce<CreatePaymentItemPayload[]>(
      (acc, item, index) => {
        const plannedAmount = parseCurrencyInput(item.plannedAmount);
        const paidAmount = parseCurrencyInput(item.paidAmount);

        if (!plannedAmount || plannedAmount <= 0) {
          return acc;
        }

        if (
          !item.status?.trim() ||
          (mode === "edit" && !item.paymentDate?.trim()) ||
          paidAmount == null
        ) {
          return acc;
        }

        acc.push({
          origin: item.origin as CreatePaymentItemPayload["origin"],
          plannedAmount,
          status: item.status as CreatePaymentItemPayload["status"],
          paidAmount,
          paymentDate: mode === "edit" ? item.paymentDate : undefined,
          dueDate: item.dueDate || undefined,
          proofUrl: item.proofUrl || undefined,
          notes: item.notes || undefined,
          sortOrder: index,
        });

        return acc;
      },
      [],
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    const formErrors = validateCreateForm(values);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      showError(
        paymentUiCopy.errors.invalidFormData,
        paymentValidationMessages.reviewRequiredFields,
      );
      return;
    }

    const itemsValidationError = validatePaymentItemsRequired();
    if (itemsValidationError) {
      showError(paymentUiCopy.errors.invalidFormData, itemsValidationError);
      return;
    }

    const itemsPayload = buildItemsPayload();
    if (itemsPayload.length === 0) {
      showError(
        paymentUiCopy.errors.invalidFormData,
        paymentValidationMessages.itemsRequired,
      );
      return;
    }

    if (mode === "create") {
      const payload: CreatePaymentPayload = {
        idLeads: values.idLeads,
        idBudgets: values.idBudgets || undefined,
        idContracts: values.idContracts || undefined,
        idEvents: values.idEvents || undefined,
        notes: values.notes || undefined,
        paymentItems: itemsPayload,
      };

      const result = await save(payload, null);
      if (result) {
        navigate(paymentRoutePaths.edit(result.idPayments));
      }
      return;
    }

    const updatePayload: UpdatePaymentPayload = {
      notes: values.notes || undefined,
      paymentItems: itemsPayload,
    };

    if (!editingPayment) {
      showError(
        paymentUiCopy.errors.invalidPaymentData,
        paymentUiCopy.form.notices.missingPaymentForUpdate,
      );
      return;
    }

    await save(updatePayload, editingPayment);
  }

  if (loadingPayment) {
    return (
      <ManagementPanelTemplate
        title={paymentUiCopy.form.editTitle}
        description={paymentUiCopy.form.notices.loadingPayment}
      >
        <div className="flex h-64 items-center justify-center">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2"
            style={{ borderColor: "#C9A227", borderTopColor: "transparent" }}
          />
        </div>
      </ManagementPanelTemplate>
    );
  }

  return (
    <ManagementPanelTemplate
      title={
        mode === "create"
          ? paymentUiCopy.form.createTitle
          : paymentUiCopy.form.editTitle
      }
      actions={
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(paymentRoutePaths.list)}
            disabled={saving}
          >
            {paymentUiCopy.form.actions.back}
          </Button>
        </div>
      }
    >
      {mode === "edit" &&
        (selectedLead ||
          selectedBudget ||
          selectedContract ||
          values.idEvents) && (
          <SectionCard title={paymentUiCopy.form.sections.infoSection}>
            <div className="space-y-6">
              {/* Info Fields Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {selectedLead && (
                  <InfoField
                    label={paymentUiCopy.form.labels.idLeads}
                    value={selectedLead.name}
                  />
                )}
                {selectedBudget && (
                  <InfoField
                    label={paymentUiCopy.form.labels.idBudgets}
                    value={selectedBudget.budgetNumber}
                  />
                )}
                {selectedContract && (
                  <InfoField
                    label={paymentUiCopy.form.labels.idContracts}
                    value={selectedContract.contractNumber}
                  />
                )}
                {values.idEvents && (
                  <InfoField
                    label={paymentUiCopy.form.labels.idEvents}
                    value={selectedEvent?.eventNumber || values.idEvents}
                  />
                )}
              </div>

              {/* Payment Items Extract */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
                  Extrato dos valores
                </p>
                <div className="mt-2 rounded-xl border border-[#e8d5c9] bg-white p-3">
                  {paymentItems.length > 0 ? (
                    <div className="space-y-2">
                      {paymentItems.map((item, index) => {
                        const plannedAmount =
                          parseCurrencyInput(item.plannedAmount) ?? 0;
                        return (
                          <div key={index}>
                            <div className="flex items-start justify-between gap-3 text-sm">
                              <div>
                                <p className="font-medium text-[#2c1810]">
                                  {
                                    paymentUiCopy.form.options.origins[
                                      item.origin as keyof typeof paymentUiCopy.form.options.origins
                                    ]
                                  }
                                </p>
                                <p className="text-xs text-[#7a4430]">
                                  {
                                    paymentUiCopy.form.options.statuses[
                                      item.status as keyof typeof paymentUiCopy.form.options.statuses
                                    ]
                                  }
                                </p>
                              </div>
                              <p className="font-semibold text-[#2c1810]">
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(plannedAmount)}
                              </p>
                            </div>
                            {index < paymentItems.length - 1 && (
                              <div className="my-2 h-px w-full bg-[#e8d5c9]" />
                            )}
                          </div>
                        );
                      })}
                      <div className="my-2 h-px w-full bg-[#e8d5c9]" />
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <p className="text-[#7a4430]">
                          Total de valores previstos
                        </p>
                        <p className="text-[#2c1810]">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(
                            paymentItems.reduce(
                              (sum, item) =>
                                sum +
                                (parseCurrencyInput(item.plannedAmount) ?? 0),
                              0,
                            ),
                          )}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[#7a4430]">
                      Nenhum item de pagamento adicionado.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>
        )}

      <GenericForm
        fields={fields}
        values={values}
        setValues={setValues}
        onSubmit={onSubmit}
        errors={errors}
        saving={saving}
        onCancel={() => navigate(paymentRoutePaths.list)}
      >
        <SectionCard title={paymentUiCopy.form.sections.itemsTitle}>
          <div>
            <p className="mb-4 text-sm text-[#7a4430]">
              {paymentUiCopy.form.sections.itemsDescription}
            </p>
          </div>
          <PaymentItemsEditor
            items={paymentItems}
            onUpdateItem={updatePaymentItem}
            disabled={saving}
            disableReferenceFields={mode === "edit"}
          />

          <div className="mt-6 border-t border-[#e8d5c9] pt-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
              {paymentUiCopy.form.labels.notes}
            </label>
            <textarea
              value={values.notes}
              onChange={(e) => setValues({ ...values, notes: e.target.value })}
              placeholder={paymentUiCopy.form.placeholders.notes}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: "#e8d5c9" }}
              rows={4}
              disabled={saving}
            />
          </div>
        </SectionCard>
      </GenericForm>
    </ManagementPanelTemplate>
  );
}
