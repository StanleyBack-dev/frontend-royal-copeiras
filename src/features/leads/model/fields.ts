import type { FormField } from "../../../components/organisms/GenericForm";
import { leadSourceOptions } from "../../../api/leads/schema";
import { BRAZILIAN_STATE_OPTIONS } from "../../../shared/constants/brazilian-states";
import {
  LEAD_ADDRESS_CITY_MAX_LENGTH,
  LEAD_ADDRESS_COMPLEMENT_MAX_LENGTH,
  LEAD_ADDRESS_NEIGHBORHOOD_MAX_LENGTH,
  LEAD_ADDRESS_NUMBER_MAX_LENGTH,
  LEAD_ADDRESS_STREET_MAX_LENGTH,
  LEAD_ADDRESS_ZIP_CODE_MASK_LENGTH,
  LEAD_CNPJ_MASK_LENGTH,
  LEAD_CPF_MASK_LENGTH,
  LEAD_EMAIL_MAX_LENGTH,
  LEAD_LEGAL_NAME_MAX_LENGTH,
  LEAD_NAME_MAX_LENGTH,
  LEAD_PHONE_LANDLINE_MASK_LENGTH,
  LEAD_PHONE_MOBILE_MASK_LENGTH,
} from "./constants";
import type { LeadFormValues } from "./form";
import { leadUiCopy } from "./messages";

export function getLeadFormFields(
  values: LeadFormValues,
  options?: { isEditing?: boolean },
): FormField[] {
  return [
    ...(options?.isEditing
      ? [
          {
            name: "createdAt",
            label: leadUiCopy.form.labels.createdAt,
            readOnly: true,
            disabled: true,
            colSpan: 2 as const,
          },
        ]
      : []),
    {
      name: "name",
      label: leadUiCopy.form.labels.name,
      required: true,
      placeholder: leadUiCopy.form.placeholders.name,
      maxLength: LEAD_NAME_MAX_LENGTH,
      colSpan: 2,
    },
    {
      name: "email",
      label: leadUiCopy.form.labels.email,
      type: "email",
      placeholder: leadUiCopy.form.placeholders.email,
      maxLength: LEAD_EMAIL_MAX_LENGTH,
      inputMode: "email",
      colSpan: 2,
    },
    {
      name: "type",
      label: leadUiCopy.form.labels.type,
      as: "select",
      options: [
        { value: "individual", label: leadUiCopy.form.options.person },
        { value: "company", label: leadUiCopy.form.options.company },
      ],
    },
    ...(values.type === "individual"
      ? [
          {
            name: "cpf",
            label: leadUiCopy.form.labels.cpf,
            placeholder: leadUiCopy.form.placeholders.cpf,
            maxLength: LEAD_CPF_MASK_LENGTH,
            inputMode: "numeric" as const,
          },
        ]
      : [
          {
            name: "cnpj",
            label: leadUiCopy.form.labels.cnpj,
            placeholder: leadUiCopy.form.placeholders.cnpj,
            maxLength: LEAD_CNPJ_MASK_LENGTH,
            inputMode: "numeric" as const,
          },
          {
            name: "legalName",
            label: leadUiCopy.form.labels.legalName,
            placeholder: leadUiCopy.form.placeholders.legalName,
            maxLength: LEAD_LEGAL_NAME_MAX_LENGTH,
            colSpan: 2 as const,
          },
        ]),
    {
      name: "addressZipCode",
      label: leadUiCopy.form.labels.addressZipCode,
      placeholder: leadUiCopy.form.placeholders.addressZipCode,
      maxLength: LEAD_ADDRESS_ZIP_CODE_MASK_LENGTH,
      inputMode: "numeric",
    },
    {
      name: "addressStreet",
      label: leadUiCopy.form.labels.addressStreet,
      placeholder: leadUiCopy.form.placeholders.addressStreet,
      maxLength: LEAD_ADDRESS_STREET_MAX_LENGTH,
      colSpan: 2,
    },
    {
      name: "addressNumber",
      label: leadUiCopy.form.labels.addressNumber,
      placeholder: leadUiCopy.form.placeholders.addressNumber,
      maxLength: LEAD_ADDRESS_NUMBER_MAX_LENGTH,
      disabled: values.addressNoNumber,
    },
    {
      name: "addressNoNumber",
      label: leadUiCopy.form.labels.addressNoNumber,
      type: "checkbox",
    },
    {
      name: "addressComplement",
      label: leadUiCopy.form.labels.addressComplement,
      placeholder: leadUiCopy.form.placeholders.addressComplement,
      maxLength: LEAD_ADDRESS_COMPLEMENT_MAX_LENGTH,
    },
    {
      name: "addressNeighborhood",
      label: leadUiCopy.form.labels.addressNeighborhood,
      placeholder: leadUiCopy.form.placeholders.addressNeighborhood,
      maxLength: LEAD_ADDRESS_NEIGHBORHOOD_MAX_LENGTH,
      colSpan: 2,
    },
    {
      name: "addressCity",
      label: leadUiCopy.form.labels.addressCity,
      placeholder: leadUiCopy.form.placeholders.addressCity,
      maxLength: LEAD_ADDRESS_CITY_MAX_LENGTH,
    },
    {
      name: "addressState",
      label: leadUiCopy.form.labels.addressState,
      as: "select",
      options: [
        { value: "", label: "Selecione a UF" },
        ...BRAZILIAN_STATE_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        })),
      ],
    },
    {
      name: "contactType",
      label: leadUiCopy.form.labels.contactType,
      as: "select",
      options: [
        { value: "mobile", label: leadUiCopy.form.options.mobile },
        { value: "landline", label: leadUiCopy.form.options.landline },
      ],
    },
    {
      name: "phone",
      label: leadUiCopy.form.labels.phone,
      placeholder:
        values.contactType === "landline"
          ? leadUiCopy.form.placeholders.landlinePhone
          : leadUiCopy.form.placeholders.mobilePhone,
      maxLength:
        values.contactType === "landline"
          ? LEAD_PHONE_LANDLINE_MASK_LENGTH
          : LEAD_PHONE_MOBILE_MASK_LENGTH,
      inputMode: "tel",
    },
    {
      name: "source",
      label: leadUiCopy.form.labels.source,
      as: "select",
      required: true,
      options: [
        { value: "", label: leadUiCopy.form.options.selectSource },
        ...leadSourceOptions.map((value) => ({
          value,
          label: leadUiCopy.form.sourceOptions[value],
        })),
      ],
    },
    {
      name: "status",
      label: leadUiCopy.form.labels.status,
      as: "select",
      options: [
        { value: "new", label: leadUiCopy.form.options.new },
        { value: "qualified", label: leadUiCopy.form.options.qualified },
        { value: "won", label: leadUiCopy.form.options.won },
        { value: "lost", label: leadUiCopy.form.options.lost },
      ],
    },
    {
      name: "isActive",
      label: leadUiCopy.form.labels.isActive,
      type: "checkbox",
    },
    {
      name: "notes",
      label: leadUiCopy.form.labels.notes,
      as: "textarea",
      placeholder: leadUiCopy.form.placeholders.notes,
      colSpan: 2,
    },
  ];
}
