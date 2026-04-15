import type { FormField } from "../../../components/organisms/GenericForm";
import {
  EMPLOYEE_CNPJ_MASK_LENGTH,
  EMPLOYEE_CPF_MASK_LENGTH,
  EMPLOYEE_EMAIL_MAX_LENGTH,
  EMPLOYEE_NAME_MAX_LENGTH,
  EMPLOYEE_PHONE_LANDLINE_MASK_LENGTH,
  EMPLOYEE_PHONE_MOBILE_MASK_LENGTH,
  EMPLOYEE_POSITION_MAX_LENGTH,
} from "./constants";
import type { EmployeeFormValues } from "./form";
import { employeeUiCopy } from "./messages";

export function getEmployeeFormFields(
  values: EmployeeFormValues,
  options?: { isEditing?: boolean },
): FormField[] {
  return [
    ...(options?.isEditing
      ? [
          {
            name: "createdAt",
            label: employeeUiCopy.form.labels.createdAt,
            readOnly: true,
            disabled: true,
            colSpan: 2 as const,
          },
        ]
      : []),
    {
      name: "name",
      label: employeeUiCopy.form.labels.name,
      required: true,
      placeholder: employeeUiCopy.form.placeholders.name,
      maxLength: EMPLOYEE_NAME_MAX_LENGTH,
      colSpan: 2,
    },
    {
      name: "type",
      label: employeeUiCopy.form.labels.type,
      as: "select",
      options: [
        { value: "individual", label: employeeUiCopy.form.options.person },
        { value: "company", label: employeeUiCopy.form.options.company },
      ],
    },
    ...(values.type === "individual"
      ? [
          {
            name: "cpf",
            label: employeeUiCopy.form.labels.cpf,
            placeholder: employeeUiCopy.form.placeholders.cpf,
            maxLength: EMPLOYEE_CPF_MASK_LENGTH,
            inputMode: "numeric" as const,
          },
        ]
      : [
          {
            name: "cnpj",
            label: employeeUiCopy.form.labels.cnpj,
            placeholder: employeeUiCopy.form.placeholders.cnpj,
            maxLength: EMPLOYEE_CNPJ_MASK_LENGTH,
            inputMode: "numeric" as const,
          },
        ]),
    {
      name: "contactType",
      label: employeeUiCopy.form.labels.contactType,
      as: "select",
      options: [
        { value: "mobile", label: employeeUiCopy.form.options.mobile },
        { value: "landline", label: employeeUiCopy.form.options.landline },
      ],
    },
    {
      name: "phone",
      label: employeeUiCopy.form.labels.phone,
      placeholder:
        values.contactType === "landline"
          ? employeeUiCopy.form.placeholders.landlinePhone
          : employeeUiCopy.form.placeholders.mobilePhone,
      maxLength:
        values.contactType === "landline"
          ? EMPLOYEE_PHONE_LANDLINE_MASK_LENGTH
          : EMPLOYEE_PHONE_MOBILE_MASK_LENGTH,
      inputMode: "tel",
    },
    {
      name: "position",
      label: employeeUiCopy.form.labels.position,
      required: true,
      placeholder: employeeUiCopy.form.placeholders.position,
      maxLength: EMPLOYEE_POSITION_MAX_LENGTH,
    },
    {
      name: "email",
      label: employeeUiCopy.form.labels.email,
      type: "email",
      placeholder: employeeUiCopy.form.placeholders.email,
      maxLength: EMPLOYEE_EMAIL_MAX_LENGTH,
      inputMode: "email",
    },
    {
      name: "isActive",
      label: employeeUiCopy.form.labels.isActive,
      type: "checkbox",
    },
  ];
}
