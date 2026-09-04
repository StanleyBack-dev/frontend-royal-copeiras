import type { Lead } from "../../../api/leads/schema";
import type { FormField } from "../../../components/organisms/GenericForm";
import {
  budgetAdvancePercentageOptions,
  budgetDiscountPercentageOptions,
  budgetDurationOptions,
  budgetPaymentMethodOptions,
  type BudgetFormValues,
} from "./form";
import { budgetUiCopy } from "./messages";

export function getBudgetFormFields(
  values: BudgetFormValues,
  options: {
    isEditing?: boolean;
    leads: Lead[];
    disableAll?: boolean;
    currentLeadId?: string;
  },
): FormField[] {
  const disableAll = Boolean(options.disableAll);
  const visibleLeads = options.leads.filter(
    (lead) => lead.isActive || lead.idLeads === options.currentLeadId,
  );
  const leadOptions = [
    { value: "", label: budgetUiCopy.form.placeholders.lead },
    ...visibleLeads.map((lead) => ({
      value: lead.idLeads,
      label: lead.isActive ? lead.name : `${lead.name} (inativo)`,
    })),
  ];

  return [
    ...(options.isEditing
      ? [
          {
            name: "budgetNumber",
            label: budgetUiCopy.form.labels.budgetNumber,
            readOnly: true,
            disabled: true,
          },
          {
            name: "createdAt",
            label: "Criado em",
            readOnly: true,
            disabled: true,
          },
        ]
      : []),
    {
      name: "idLeads",
      label: budgetUiCopy.form.labels.lead,
      as: "select",
      options: leadOptions,
      colSpan: 2,
      required: true,
      disabled: disableAll,
    },
    {
      name: "issueDate",
      label: budgetUiCopy.form.labels.issueDate,
      type: "date",
      required: true,
      disabled: disableAll,
    },
    {
      name: "validUntil",
      label: budgetUiCopy.form.labels.validUntil,
      type: "date",
      required: true,
      disabled: disableAll,
    },
    {
      name: "eventDateMode",
      label: budgetUiCopy.form.labels.eventDateMode,
      as: "select",
      options: [
        { value: "single", label: budgetUiCopy.form.options.singleDay },
        { value: "multiple", label: budgetUiCopy.form.options.multipleDays },
      ],
      required: true,
      disabled: disableAll,
    },
    ...(values.eventDateMode === "multiple"
      ? [
          {
            name: "eventDaysCount",
            label: budgetUiCopy.form.labels.eventDaysCount,
            as: "select" as const,
            options: Array.from({ length: 9 }, (_, index) => ({
              value: String(index + 2),
              label: `${index + 2} dias`,
            })),
            required: true,
            disabled: disableAll,
          },
        ]
      : []),
    {
      name: "eventLocation",
      label: budgetUiCopy.form.labels.eventLocation,
      placeholder: budgetUiCopy.form.placeholders.eventLocation,
      colSpan: 2,
      required: true,
      disabled: disableAll,
    },
    {
      name: "guestCount",
      label: budgetUiCopy.form.labels.guestCount,
      placeholder: budgetUiCopy.form.placeholders.guestCount,
      inputMode: "numeric",
      required: true,
      disabled: disableAll,
    },
    {
      name: "durationHours",
      label: budgetUiCopy.form.labels.durationHours,
      as: "select",
      options: [
        { value: "", label: "Selecione a duração" },
        ...budgetDurationOptions,
      ],
      required: true,
      disabled: disableAll,
    },
    {
      name: "paymentMethod",
      label: budgetUiCopy.form.labels.paymentMethod,
      as: "select",
      options: [
        { value: "", label: "Selecione a forma de pagamento" },
        ...budgetPaymentMethodOptions.map((option) => ({
          value: option,
          label:
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
                      : budgetUiCopy.form.paymentMethodOptions.cash,
        })),
      ],
      required: true,
      disabled: disableAll,
    },
    {
      name: "advancePercentage",
      label: budgetUiCopy.form.labels.advancePercentage,
      as: "select",
      options: [
        { value: "", label: "Sem entrada" },
        ...budgetAdvancePercentageOptions,
      ],
      required: true,
      disabled: disableAll,
    },
    {
      name: "discountType",
      label: "Tipo de Desconto",
      as: "select",
      options: [
        { value: "", label: "Sem desconto" },
        { value: "percentage", label: "Desconto (%)" },
        { value: "amount", label: "Desconto (R$)" },
      ],
      required: false,
      disabled: disableAll,
    },
    ...(values.discountType === "percentage"
      ? [
          {
            name: "discountPercentage",
            label: budgetUiCopy.form.labels.discountPercentage,
            as: "select" as const,
            options: [
              { value: "", label: "Selecione o desconto" },
              ...budgetDiscountPercentageOptions,
            ],
            required: true,
            disabled: disableAll,
          },
        ]
      : []),
    ...(values.discountType === "amount"
      ? [
          {
            name: "discountAmount",
            label: "Valor do Desconto (R$)",
            placeholder: "Ex: R$ 150,00",
            inputMode: "numeric" as const,
            required: true,
            disabled: disableAll,
          },
        ]
      : []),
  ];
}
