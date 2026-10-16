import { Plus, Trash2 } from "lucide-react";
import {
  eventExtraExpenseCategoryOptions,
  type EventExtraExpenseCategory,
} from "@/api/events/schema";
import { formatCurrencyInput } from "@/features/budgets/model/formatters";
import { eventUiCopy } from "../model/messages";

export interface EventExtraExpenseDraft {
  category: EventExtraExpenseCategory | "";
  amount: string;
}

export interface EventExtraExpenseDraftErrors {
  category?: string;
  amount?: string;
}

interface EventExtraExpensesEditorProps {
  expenses: EventExtraExpenseDraft[];
  errors: EventExtraExpenseDraftErrors[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, patch: Partial<EventExtraExpenseDraft>) => void;
  disabled?: boolean;
}

const copy = eventUiCopy.detail.extraExpenses;

function fieldClassName(hasError: boolean) {
  return `h-10 rounded-lg border bg-white px-3 text-sm text-[#2c1810] outline-none transition-colors placeholder:text-[#c4a99a] focus:border-[#7a4430] disabled:opacity-60 ${hasError ? "border-red-400" : "border-[#e8d5c9]"}`;
}

export default function EventExtraExpensesEditor({
  expenses,
  errors,
  onAdd,
  onRemove,
  onUpdate,
  disabled = false,
}: EventExtraExpensesEditorProps) {
  return (
    <div>
      <div className="mb-3">
        <p className="text-sm font-semibold text-[#2c1810]">{copy.title}</p>
        <p className="text-xs text-[#9a7563]">{copy.description}</p>
      </div>

      {expenses.length > 0 ? (
        <ul className="mb-3 space-y-2">
          {expenses.map((expense, index) => {
            const rowErrors = errors[index] ?? {};
            const rowError = rowErrors.category ?? rowErrors.amount;

            return (
              <li key={index}>
                <div className="flex items-center gap-2">
                  <select
                    aria-label={copy.categoryLabel}
                    className={`${fieldClassName(Boolean(rowErrors.category))} min-w-0 flex-1 ${expense.category ? "" : "text-[#9a7563]"}`}
                    value={expense.category}
                    onChange={(e) =>
                      onUpdate(index, {
                        category: e.target.value as EventExtraExpenseCategory,
                      })
                    }
                    disabled={disabled}
                  >
                    <option value="">{copy.selectCategory}</option>
                    {eventExtraExpenseCategoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {copy.categories[category]}
                      </option>
                    ))}
                  </select>
                  <input
                    aria-label={copy.amountLabel}
                    className={`${fieldClassName(Boolean(rowErrors.amount))} w-32 text-right tabular-nums sm:w-36`}
                    value={expense.amount}
                    placeholder="R$ 0,00"
                    inputMode="decimal"
                    onChange={(e) =>
                      onUpdate(index, {
                        amount: formatCurrencyInput(e.target.value),
                      })
                    }
                    disabled={disabled}
                  />
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    disabled={disabled}
                    title={copy.remove}
                    aria-label={copy.remove}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#9a7563] transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {rowError ? (
                  <p className="mt-1 text-xs text-red-600">{rowError}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#dcc3b2] px-3 py-2.5 text-sm font-medium text-[#7a4430] transition-colors hover:border-[#7a4430] hover:bg-[#faf6f2] disabled:opacity-50"
      >
        <Plus size={16} />
        {copy.add}
      </button>
    </div>
  );
}
