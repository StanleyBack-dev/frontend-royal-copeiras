import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import type { Position } from "@/api/positions/schema";
import type { BudgetItemFormValues } from "../model/form";
import { budgetUiCopy } from "../model/messages";
import {
  buildBudgetServiceDescription,
  serviceGenderOptions,
  serviceComboKey,
  type ServiceGenderOption,
} from "../model/service-items";

interface BudgetItemsEditorProps {
  items: BudgetItemFormValues[];
  positions: Position[];
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
  positions,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  disabled = false,
}: BudgetItemsEditorProps) {
  const selectablePositions = positions.filter((position) => position.isActive);

  const selectedCombos = new Set(
    items
      .map((item) => {
        if (!item.idPositions) return null;
        const g = item.gender || "Masculino";
        return serviceComboKey(item.idPositions, g);
      })
      .filter(Boolean) as string[],
  );
  const totalCombos = selectablePositions.length * serviceGenderOptions.length;
  const allTypesSelected =
    selectedCombos.size >= totalCombos && totalCombos > 0;

  function buildDescriptionPreview(item: BudgetItemFormValues): string {
    if (!item.serviceType) {
      return "Selecione um tipo de serviço para visualizar a descrição padrão.";
    }

    const quantity = Number(item.quantity || 0);
    const genderOption = item.gender || "Masculino";
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
          disabled={
            disabled || allTypesSelected || selectablePositions.length === 0
          }
          title={
            allTypesSelected
              ? "Todos os tipos de serviço já foram selecionados"
              : selectablePositions.length === 0
                ? "Cadastre cargos ativos no módulo de cargos para adicionar itens"
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
              if (!other.idPositions) return null;
              const g = other.gender || "Masculino";
              return serviceComboKey(other.idPositions, g);
            })
            .filter(Boolean) as string[],
        );

        // A position is available if at least one gender variant is not taken by other items
        const isPositionAvailable = (idPositions: string) =>
          serviceGenderOptions.some(
            (g) => !otherCombos.has(serviceComboKey(idPositions, g)),
          );

        const selectedPosition = selectablePositions.find(
          (position) => position.idPositions === item.idPositions,
        );
        const serviceLabel = selectedPosition?.name || item.serviceType;

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
                  value={item.idPositions}
                  onChange={(event) => {
                    const nextPositionId = event.target.value;
                    const nextPosition = selectablePositions.find(
                      (position) => position.idPositions === nextPositionId,
                    );
                    const nextServiceType = nextPosition?.name || "";
                    let nextGender: ServiceGenderOption | "" = "";
                    if (nextPositionId) {
                      const preferred: ServiceGenderOption = "Masculino";
                      const preferredTaken = otherCombos.has(
                        serviceComboKey(nextPositionId, preferred),
                      );
                      nextGender = preferredTaken
                        ? (serviceGenderOptions.find(
                            (g) =>
                              !otherCombos.has(
                                serviceComboKey(nextPositionId, g),
                              ),
                          ) ?? preferred)
                        : preferred;
                    }
                    const nextQuantity = Number(item.quantity || 0);
                    onUpdateItem(index, {
                      idPositions: nextPositionId,
                      serviceType: nextServiceType,
                      gender: nextGender,
                      description: nextServiceType
                        ? buildBudgetServiceDescription(
                            nextServiceType,
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
                  {selectablePositions
                    .filter(
                      (position) =>
                        position.idPositions === item.idPositions ||
                        isPositionAvailable(position.idPositions),
                    )
                    .map((position) => (
                      <option
                        key={position.idPositions}
                        value={position.idPositions}
                      >
                        {position.name}
                      </option>
                    ))}
                </select>
                {serviceLabel && (
                  <div className="mt-2 flex gap-3">
                    {serviceGenderOptions.map((opt) => {
                      const isTakenByOther = otherCombos.has(
                        serviceComboKey(item.idPositions, opt),
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
                            checked={(item.gender || "Masculino") === opt}
                            onChange={() => {
                              const nextQuantity = Number(item.quantity || 0);
                              onUpdateItem(index, {
                                gender: opt,
                                description: buildBudgetServiceDescription(
                                  serviceLabel,
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
                    item.gender || (serviceLabel ? "Masculino" : undefined);
                  onUpdateItem(index, {
                    quantity: event.target.value,
                    description: serviceLabel
                      ? buildBudgetServiceDescription(
                          serviceLabel,
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
