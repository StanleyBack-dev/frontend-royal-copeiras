import type { FormField } from "../../../components/organisms/GenericForm";
import { SUPPLY_NAME_MAX_LENGTH } from "./constants";
import type { SupplyFormValues } from "./form";
import { supplyUiCopy } from "./messages";
import { SUPPLY_UNIT_OPTIONS } from "./units";

export function getSupplyFormFields(
  values: SupplyFormValues,
  options?: { isEditing?: boolean },
): FormField[] {
  const unitOptions = [
    { value: "", label: supplyUiCopy.form.placeholders.defaultUnit },
    ...SUPPLY_UNIT_OPTIONS.map((option) => ({
      value: option.value,
      label: option.label,
    })),
    // Keep a legacy/free-text unit visible instead of silently blanking it.
    ...(values.defaultUnit &&
    !SUPPLY_UNIT_OPTIONS.some((option) => option.value === values.defaultUnit)
      ? [{ value: values.defaultUnit, label: values.defaultUnit }]
      : []),
  ];

  return [
    ...(options?.isEditing
      ? [
          {
            name: "createdAt",
            label: supplyUiCopy.form.labels.createdAt,
            readOnly: true,
            disabled: true,
            colSpan: 2 as const,
          },
        ]
      : []),
    {
      name: "name",
      label: supplyUiCopy.form.labels.name,
      required: true,
      placeholder: supplyUiCopy.form.placeholders.name,
      maxLength: SUPPLY_NAME_MAX_LENGTH,
      colSpan: 2,
    },
    {
      name: "defaultUnit",
      label: supplyUiCopy.form.labels.defaultUnit,
      as: "select",
      options: unitOptions,
    },
    {
      name: "suggestedUnitPrice",
      label: supplyUiCopy.form.labels.suggestedUnitPrice,
      placeholder: supplyUiCopy.form.placeholders.suggestedUnitPrice,
      inputMode: "decimal",
    },
    {
      name: "isActive",
      label: supplyUiCopy.form.labels.isActive,
      type: "checkbox",
    },
  ];
}
