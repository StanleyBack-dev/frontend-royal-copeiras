import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";
import type { BudgetItemFormValues } from "../model/form";
import { budgetUiCopy } from "../model/messages";

interface BudgetItemsEditorProps {
  items: BudgetItemFormValues[];
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, patch: Partial<BudgetItemFormValues>) => void;
  disabled?: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function BudgetItemsEditor({
  items,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  disabled = false,
}: BudgetItemsEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#7a4430]">
            {budgetUiCopy.form.labels.items}
          </h3>
          <p className="mt-1 text-sm text-[#7a4430]">
            Estruture o escopo comercial em linhas independentes para facilitar
            revisão e totalização.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onAddItem}
          disabled={disabled}
        >
          {budgetUiCopy.form.actions.addItem}
        </Button>
      </div>

      {items.map((item, index) => {
        const quantity = Number(item.quantity || 0);
        const unitPrice =
          Number(item.unitPrice.replace(/[^\d]/g, "")) / 100 || 0;
        const total = quantity * unitPrice;

        return (
          <div
            key={item.id || `budget-item-${index}`}
            className="rounded-2xl border border-[#e8d5c9] bg-[#faf6f2] p-4"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <Input
                label="Descrição *"
                value={item.description}
                onChange={(event) =>
                  onUpdateItem(index, { description: event.target.value })
                }
                placeholder={budgetUiCopy.form.placeholders.itemDescription}
                wrapperClassName="md:col-span-5"
                required
                disabled={disabled}
              />
              <Input
                label="Quantidade *"
                type="number"
                min={1}
                step={1}
                value={item.quantity}
                onChange={(event) =>
                  onUpdateItem(index, { quantity: event.target.value })
                }
                placeholder={budgetUiCopy.form.placeholders.itemQuantity}
                wrapperClassName="md:col-span-2"
                inputMode="numeric"
                required
                disabled={disabled}
              />
              <Input
                label="Valor unitário *"
                value={item.unitPrice}
                onChange={(event) =>
                  onUpdateItem(index, { unitPrice: event.target.value })
                }
                placeholder={budgetUiCopy.form.placeholders.itemUnitPrice}
                wrapperClassName="md:col-span-3"
                inputMode="decimal"
                required
                disabled={disabled}
              />
              <div className="md:col-span-2 flex flex-col justify-end">
                <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
                  Total do item
                </span>
                <div className="rounded-lg border border-[#e8d5c9] bg-white px-3 py-2.5 text-sm text-[#2c1810]">
                  {formatCurrency(total)}
                </div>
              </div>
              <Textarea
                label="Observações do item"
                value={item.notes}
                onChange={(event) =>
                  onUpdateItem(index, { notes: event.target.value })
                }
                placeholder={budgetUiCopy.form.placeholders.itemNotes}
                wrapperClassName="md:col-span-10"
                rows={2}
                disabled={disabled}
              />
              <div className="md:col-span-2 flex items-end">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => onRemoveItem(index)}
                  disabled={disabled || items.length <= 1}
                >
                  {budgetUiCopy.form.actions.removeItem}
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
