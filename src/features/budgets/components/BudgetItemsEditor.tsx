import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import type { BudgetItemFormValues } from "../model/form";
import { budgetUiCopy } from "../model/messages";
import {
  buildBudgetServiceDescription,
  budgetServiceTypeOptions,
} from "../model/service-items";

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
  const selectedTypes = new Set(
    items.map((item) => item.serviceType).filter(Boolean),
  );
  const allTypesSelected =
    selectedTypes.size >= budgetServiceTypeOptions.length;

  function buildDescriptionPreview(item: BudgetItemFormValues): string {
    if (!item.serviceType) {
      return "Selecione um tipo de serviço para visualizar a descrição padrão.";
    }

    const quantity = Number(item.quantity || 0);
    return buildBudgetServiceDescription(item.serviceType, quantity);
  }

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
          disabled={disabled || allTypesSelected}
          title={
            allTypesSelected
              ? "Todos os tipos de serviço já foram selecionados"
              : undefined
          }
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
              <div className="md:col-span-5">
                <label className="text-xs font-semibold uppercase tracking-wide mb-1 block text-[#7a4430]">
                  Tipo de serviço *
                </label>
                <select
                  className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                  style={{
                    borderColor: "#e8d5c9",
                    color: "#2C1810",
                    background: disabled ? "#f5ede8" : "#fff",
                  }}
                  value={item.serviceType}
                  onChange={(event) => {
                    const nextType = event.target
                      .value as BudgetItemFormValues["serviceType"];
                    const nextQuantity = Number(item.quantity || 0);
                    onUpdateItem(index, {
                      serviceType: nextType,
                      description: nextType
                        ? buildBudgetServiceDescription(nextType, nextQuantity)
                        : "",
                    });
                  }}
                  disabled={disabled}
                >
                  <option value="">
                    {budgetUiCopy.form.placeholders.itemServiceType}
                  </option>
                  {budgetServiceTypeOptions
                    .filter(
                      (type) =>
                        type === item.serviceType || !selectedTypes.has(type),
                    )
                    .map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                </select>
              </div>
              <Input
                label="Quantidade *"
                type="number"
                min={1}
                step={1}
                value={item.quantity}
                onChange={(event) =>
                  onUpdateItem(index, {
                    quantity: event.target.value,
                    description: item.serviceType
                      ? buildBudgetServiceDescription(
                          item.serviceType,
                          Number(event.target.value || 0),
                        )
                      : item.description,
                  })
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
              <div className="md:col-span-12">
                <label className="text-xs font-semibold uppercase tracking-wide mb-1 block text-[#7a4430]">
                  Descrição (gerada automaticamente)
                </label>
                <div className="rounded-lg border border-[#e8d5c9] bg-white px-3 py-2.5 text-sm text-[#2c1810] whitespace-pre-line min-h-[92px]">
                  {buildDescriptionPreview(item)}
                </div>
              </div>
              <div className="md:col-span-12 flex items-end justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full md:w-auto"
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
