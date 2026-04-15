import type { FormField } from "../../../components/organisms/GenericForm";
import {
  CUSTOMER_ADDRESS_MAX_LENGTH,
  CUSTOMER_CNPJ_MASK_LENGTH,
  CUSTOMER_CPF_MASK_LENGTH,
  CUSTOMER_EMAIL_MAX_LENGTH,
  CUSTOMER_LANDLINE_MASK_LENGTH,
  CUSTOMER_MOBILE_MASK_LENGTH,
  CUSTOMER_NAME_MAX_LENGTH,
} from "./constants";
import type { CustomerFormValues } from "./form";
import { customerUiCopy } from "./messages";

export function getCustomerFormFields(
  values: CustomerFormValues,
  options?: { isEditing?: boolean },
): FormField[] {
  return [
    ...(options?.isEditing
      ? [
          {
            name: "createdAt",
            label: customerUiCopy.form.labels.createdAt,
            readOnly: true,
            disabled: true,
            colSpan: 2 as const,
          },
        ]
      : []),
    {
      name: "name",
      label: customerUiCopy.form.labels.name,
      required: true,
      placeholder: customerUiCopy.form.placeholders.name,
      maxLength: CUSTOMER_NAME_MAX_LENGTH,
      colSpan: 2,
    },
    {
      name: "type",
      label: customerUiCopy.form.labels.type,
      as: "select",
      options: [
        { value: "individual", label: customerUiCopy.form.options.person },
        { value: "company", label: customerUiCopy.form.options.company },
      ],
    },
    ...(values.type === "individual"
      ? [
          {
            name: "cpf",
            label: customerUiCopy.form.labels.cpf,
            placeholder: customerUiCopy.form.placeholders.cpf,
            maxLength: CUSTOMER_CPF_MASK_LENGTH,
            inputMode: "numeric" as const,
          },
        ]
      : [
          {
            name: "cnpj",
            label: customerUiCopy.form.labels.cnpj,
            placeholder: customerUiCopy.form.placeholders.cnpj,
            maxLength: CUSTOMER_CNPJ_MASK_LENGTH,
            inputMode: "numeric" as const,
          },
        ]),
    {
      name: "contactType",
      label: customerUiCopy.form.labels.contactType,
      as: "select",
      options: [
        { value: "mobile", label: customerUiCopy.form.options.mobile },
        { value: "landline", label: customerUiCopy.form.options.landline },
      ],
    },
    {
      name: "phone",
      label: customerUiCopy.form.labels.phone,
      placeholder:
        values.contactType === "landline"
          ? customerUiCopy.form.placeholders.landlinePhone
          : customerUiCopy.form.placeholders.mobilePhone,
      maxLength:
        values.contactType === "landline"
          ? CUSTOMER_LANDLINE_MASK_LENGTH
          : CUSTOMER_MOBILE_MASK_LENGTH,
      inputMode: "tel",
    },
    {
      name: "email",
      label: customerUiCopy.form.labels.email,
      type: "email",
      placeholder: customerUiCopy.form.placeholders.email,
      maxLength: CUSTOMER_EMAIL_MAX_LENGTH,
      inputMode: "email",
      colSpan: 2,
    },
    {
      name: "address",
      label: customerUiCopy.form.labels.address,
      placeholder: customerUiCopy.form.placeholders.address,
      maxLength: CUSTOMER_ADDRESS_MAX_LENGTH,
      colSpan: 2,
    },
    {
      name: "isActive",
      label: customerUiCopy.form.labels.isActive,
      type: "checkbox",
    },
  ];
}
