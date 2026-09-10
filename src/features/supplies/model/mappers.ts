import type { CreateSupplyPayload, Supply } from "../../../api/supplies/schema";
import { formatDateTimeDisplay } from "../../../utils/format";
import type { SupplyFormValues } from "./form";

function parsePrice(value: string): number | undefined {
  const normalized = value
    .replace(/\s/g, "")
    .replace(/R\$/i, "")
    .replace(/\./g, "")
    .replace(",", ".");
  if (!normalized) {
    return undefined;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function mapSupplyToFormValues(supply: Supply): SupplyFormValues {
  return {
    name: supply.name,
    defaultUnit: supply.defaultUnit ?? "",
    suggestedUnitPrice:
      supply.suggestedUnitPrice != null
        ? String(supply.suggestedUnitPrice)
        : "",
    createdAt: formatDateTimeDisplay(supply.createdAt),
    isActive: supply.isActive,
  };
}

export function mapSupplyFormToValidationInput(values: SupplyFormValues) {
  return {
    name: values.name,
    defaultUnit: values.defaultUnit,
    suggestedUnitPrice: values.suggestedUnitPrice,
    isActive: values.isActive,
  };
}

export function mapSupplyFormToPayload(
  values: SupplyFormValues,
): CreateSupplyPayload {
  return {
    name: values.name,
    defaultUnit: values.defaultUnit.trim() || undefined,
    suggestedUnitPrice: parsePrice(values.suggestedUnitPrice),
    isActive: values.isActive,
  };
}
