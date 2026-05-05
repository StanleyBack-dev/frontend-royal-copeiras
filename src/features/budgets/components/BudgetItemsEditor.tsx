import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import type { BudgetItemFormValues } from "../model/form";
import { budgetUiCopy } from "../model/messages";
import {
  buildBudgetServiceDescription,
  budgetServiceTypeOptions,
  serviceGenderOptions,
  DEFAULT_SERVICE_GENDER,
  TOTAL_SERVICE_COMBOS,
  serviceComboKey,
  type BudgetServiceType,
  type ServiceGenderOption,
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
  const selectedCombos = new Set(
    items
      .map((item) => {
        if (!item.serviceType) return null;
        const g =
          item.gender ||
          DEFAULT_SERVICE_GENDER[item.serviceType as BudgetServiceType];
        return serviceComboKey(item.serviceType, g);
      })
      .filter(Boolean) as string[],
  );
  const allTypesSelected = selectedCombos.size >= TOTAL_SERVICE_COMBOS;

  function buildDescriptionPreview(item: BudgetItemFormValues): string {
    if (!item.serviceType) {
      return "Selecione um tipo de serviço para visualizar a descrição padrão.";
    }

    const quantity = Number(item.quantity || 0);
    const genderOption =
      item.gender ||
      DEFAULT_SERVICE_GENDER[item.serviceType as BudgetServiceType];
    return buildBudgetServiceDescription(
      item.serviceType,
      quantity,
      genderOption as ServiceGenderOption,
    );
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

        // Combos taken by OTHER items (used for availability checks in this row)
        const otherCombos = new Set(
          items
            .filter((_, i) => i !== index)
            .map((other) => {
              if (!other.serviceType) return null;
              const g =
                other.gender ||
                DEFAULT_SERVICE_GENDER[other.serviceType as BudgetServiceType];
              return serviceComboKey(other.serviceType, g);
            })
            .filter(Boolean) as string[],
        );

        // A type is available if at least one gender variant is not taken by other items
        const isTypeAvailable = (type: BudgetServiceType) =>
          serviceGenderOptions.some(
            (g) => !otherCombos.has(serviceComboKey(type, g)),
          );

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
                    const nextType = event.target.value as
                      | BudgetServiceType
                      | "";
                    let nextGender: ServiceGenderOption | "" = "";
                    if (nextType) {
                      const preferred =
                        DEFAULT_SERVICE_GENDER[nextType as BudgetServiceType];
                      const preferredTaken = otherCombos.has(
                        serviceComboKey(nextType, preferred),
                      );
                      nextGender = preferredTaken
                        ? (serviceGenderOptions.find(
                            (g) =>
                              !otherCombos.has(serviceComboKey(nextType, g)),
                          ) ?? preferred)
                        : preferred;
                    }
                    const nextQuantity = Number(item.quantity || 0);
                    onUpdateItem(index, {
                      serviceType: nextType,
                      gender: nextGender,
                      description: nextType
                        ? buildBudgetServiceDescription(
                            nextType,
                            nextQuantity,
                            nextGender || undefined,
                          )
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
                        type === item.serviceType || isTypeAvailable(type),
                    )
                    .map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                </select>
                {item.serviceType && (
                  <div className="mt-2 flex gap-3">
                    {serviceGenderOptions.map((opt) => {
                      const isTakenByOther = otherCombos.has(
                        serviceComboKey(item.serviceType, opt),
                      );
                      const isDisabled = disabled || isTakenByOther;
                      return (
                        <label
                          key={opt}
                          className="flex items-center gap-1.5 cursor-pointer text-sm text-[#2c1810]"
                          style={{
                            opacity: isDisabled ? 0.4 : 1,
                            pointerEvents: isDisabled ? "none" : "auto",
                          }}
                          title={
                            isTakenByOther
                              ? `${opt} já está em uso para este tipo de serviço`
                              : undefined
                          }
                        >
                          <input
                            type="radio"
                            name={`item-gender-${index}`}
                            value={opt}
                            checked={
                              (item.gender ||
                                DEFAULT_SERVICE_GENDER[
                                  item.serviceType as BudgetServiceType
                                ]) === opt
                            }
                            onChange={() => {
                              const nextQuantity = Number(item.quantity || 0);
                              onUpdateItem(index, {
                                gender: opt,
                                description: buildBudgetServiceDescription(
                                  item.serviceType as BudgetServiceType,
                                  nextQuantity,
                                  opt,
                                ),
                              });
                            }}
                            disabled={isDisabled}
                            className="accent-[#7a4430]"
                          />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
              <Input
                label="Quantidade *"
                type="number"
                min={1}
                step={1}
                value={item.quantity}
                onChange={(event) => {
                  const genderOption =
                    item.gender ||
                    (item.serviceType
                      ? DEFAULT_SERVICE_GENDER[
                          item.serviceType as BudgetServiceType
                        ]
                      : undefined);
                  onUpdateItem(index, {
                    quantity: event.target.value,
                    description: item.serviceType
                      ? buildBudgetServiceDescription(
                          item.serviceType,
                          Number(event.target.value || 0),
                          genderOption as ServiceGenderOption | undefined,
                        )
                      : item.description,
                  });
                }}
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
