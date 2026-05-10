import Input from "@/components/atoms/Input";
import {
  paymentOriginOptions,
  paymentStatusOptions,
} from "@/api/payments/schema";
import { formatCurrencyInput, parseCurrencyInput } from "../model/formatters";
import { paymentUiCopy } from "../model/messages";

export type PaymentItemFormValues = {
  origin: string;
  plannedAmount: string;
  status: string;
  paidAmount: string;
  dueDate: string;
  paymentDate: string;
  proofUrl: string;
  notes: string;
};

interface PaymentItemsEditorProps {
  items: PaymentItemFormValues[];
  onUpdateItem: (index: number, patch: Partial<PaymentItemFormValues>) => void;
  disabled?: boolean;
  disableReferenceFields?: boolean;
}

export default function PaymentItemsEditor({
  items,
  onUpdateItem,
  disabled = false,
  disableReferenceFields = false,
}: PaymentItemsEditorProps) {
  const fieldLabelClassName =
    "mb-1 block text-xs font-semibold uppercase tracking-wide text-[#7a4430]";
  const fieldControlClassName =
    "w-full rounded-lg border px-3 py-2.5 text-sm outline-none";

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const plannedAmountNumber = parseCurrencyInput(item.plannedAmount) ?? 0;
        const paidAmountNumber = parseCurrencyInput(item.paidAmount) ?? 0;
        const debtorBalance = Math.max(
          plannedAmountNumber - paidAmountNumber,
          0,
        );
        const isPartialStatus = item.status === "parcial";
        const partialReachedTotal =
          isPartialStatus &&
          plannedAmountNumber > 0 &&
          paidAmountNumber >= plannedAmountNumber;
        const showDebtorBalance = isPartialStatus && debtorBalance > 0;

        return (
          <div
            key={`payment-item-${index}`}
            className="rounded-2xl border border-[#e8d5c9] bg-[#faf6f2] p-4"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={fieldLabelClassName}>
                    {paymentUiCopy.form.labels.origin} *
                  </label>
                  <select
                    className={fieldControlClassName}
                    style={{
                      borderColor: "#e8d5c9",
                      color: "#2C1810",
                      background:
                        disabled || disableReferenceFields ? "#f5ede8" : "#fff",
                    }}
                    value={item.origin}
                    onChange={(event) =>
                      onUpdateItem(index, { origin: event.target.value })
                    }
                    disabled={disabled || disableReferenceFields}
                  >
                    {paymentOriginOptions.map((origin) => (
                      <option key={origin} value={origin}>
                        {paymentUiCopy.form.options.origins[origin]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={fieldLabelClassName}>
                    {paymentUiCopy.form.labels.status} *
                  </label>
                  <select
                    className={fieldControlClassName}
                    style={{
                      borderColor: "#e8d5c9",
                      color: "#2C1810",
                      background: disabled ? "#f5ede8" : "#fff",
                    }}
                    value={item.status}
                    onChange={(event) =>
                      onUpdateItem(index, { status: event.target.value })
                    }
                    required
                    disabled={disabled}
                  >
                    {paymentStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {paymentUiCopy.form.options.statuses[status]}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label={paymentUiCopy.form.labels.dueDate}
                  labelClassName={fieldLabelClassName}
                  type="date"
                  value={item.dueDate}
                  onChange={(event) =>
                    onUpdateItem(index, { dueDate: event.target.value })
                  }
                  disabled={disabled}
                />

                <Input
                  label={`${paymentUiCopy.form.labels.paymentDate} *`}
                  labelClassName={fieldLabelClassName}
                  type="date"
                  value={item.paymentDate}
                  onChange={(event) =>
                    onUpdateItem(index, { paymentDate: event.target.value })
                  }
                  required
                  disabled={disabled}
                />
              </div>

              <Input
                label={paymentUiCopy.form.labels.proofUrl}
                labelClassName={fieldLabelClassName}
                type="url"
                value={item.proofUrl}
                onChange={(event) =>
                  onUpdateItem(index, { proofUrl: event.target.value })
                }
                placeholder={paymentUiCopy.form.placeholders.proofUrl}
                disabled={disabled}
              />

              <div className="mt-4">
                <label className={fieldLabelClassName}>
                  {paymentUiCopy.form.sections.itemNotes}
                </label>
                <textarea
                  className="w-full rounded-lg border border-[#e8d5c9] bg-white px-3 py-2.5 text-sm text-[#2c1810] outline-none"
                  rows={2}
                  value={item.notes}
                  onChange={(event) =>
                    onUpdateItem(index, { notes: event.target.value })
                  }
                  disabled={disabled}
                  style={{ background: disabled ? "#f5ede8" : "#fff" }}
                />
              </div>

              <div className="rounded-xl border border-[#e8d5c9] bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
                  Extrato de valores
                </p>

                <div className="mt-3 space-y-3">
                  <Input
                    label={`${paymentUiCopy.form.labels.plannedAmount} *`}
                    labelClassName={fieldLabelClassName}
                    value={item.plannedAmount}
                    onChange={(event) =>
                      onUpdateItem(index, {
                        plannedAmount: formatCurrencyInput(event.target.value),
                      })
                    }
                    inputMode="decimal"
                    placeholder={paymentUiCopy.form.placeholders.plannedAmount}
                    required
                    disabled={disabled || disableReferenceFields}
                    style={{
                      background:
                        disabled || disableReferenceFields
                          ? "#f5ede8"
                          : undefined,
                    }}
                  />

                  <div>
                    <span className={fieldLabelClassName}>
                      {paymentUiCopy.form.sections.totalItem}
                    </span>
                    <div className="mt-1 flex min-h-[42px] items-center rounded-lg border border-[#e8d5c9] bg-[#f5ede8] px-3 py-2.5 text-sm text-[#2C1810]">
                      {formatCurrency(plannedAmountNumber)}
                    </div>
                  </div>

                  {showDebtorBalance ? (
                    <div>
                      <span className={fieldLabelClassName}>
                        {paymentUiCopy.form.labels.debtorBalance}
                      </span>
                      <div className="mt-1 flex min-h-[42px] items-center rounded-lg border border-[#e8d5c9] bg-[#f5ede8] px-3 py-2.5 text-sm font-medium text-[#2C1810]">
                        {formatCurrency(debtorBalance)}
                      </div>
                    </div>
                  ) : null}

                  {partialReachedTotal ? (
                    <div className="rounded-lg border border-[#d9a441] bg-[#fff7e6] px-3 py-2.5 text-sm font-medium text-[#8a5a00]">
                      {paymentUiCopy.form.notices.partialReachedTotal}
                    </div>
                  ) : null}

                  <Input
                    label={`${paymentUiCopy.form.labels.paidAmount} *`}
                    labelClassName={fieldLabelClassName}
                    value={item.paidAmount}
                    onChange={(event) =>
                      onUpdateItem(index, {
                        paidAmount: formatCurrencyInput(event.target.value),
                      })
                    }
                    inputMode="decimal"
                    placeholder={paymentUiCopy.form.placeholders.paidAmount}
                    required
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
