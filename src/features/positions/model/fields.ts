import type { FormField } from "../../../components/organisms/GenericForm";
import { POSITION_NAME_MAX_LENGTH } from "./constants";
import type { PositionFormValues } from "./form";
import { positionUiCopy } from "./messages";

export function getPositionFormFields(
  _values: PositionFormValues,
  options?: { isEditing?: boolean },
): FormField[] {
  return [
    ...(options?.isEditing
      ? [
          {
            name: "createdAt",
            label: positionUiCopy.form.labels.createdAt,
            readOnly: true,
            disabled: true,
            colSpan: 2 as const,
          },
        ]
      : []),
    {
      name: "name",
      label: positionUiCopy.form.labels.name,
      required: true,
      placeholder: positionUiCopy.form.placeholders.name,
      maxLength: POSITION_NAME_MAX_LENGTH,
      colSpan: 2,
    },
    {
      name: "isActive",
      label: positionUiCopy.form.labels.isActive,
      type: "checkbox",
    },
  ];
}
