import {
  formatCNPJ,
  formatCPF,
  formatLandline,
  formatPhone,
} from "../../../utils/format";
import type { CustomerFormValues } from "./form";

export function formatCustomerFieldValue(
  field: keyof CustomerFormValues,
  value: string,
  contactType: CustomerFormValues["contactType"],
) {
  if (field === "phone") {
    return contactType === "landline"
      ? formatLandline(value)
      : formatPhone(value);
  }

  if (field === "cpf") {
    return formatCPF(value);
  }

  if (field === "cnpj") {
    return formatCNPJ(value);
  }

  return value;
}

export function normalizeCustomerFormValues(
  nextValues: CustomerFormValues,
  previousValues: CustomerFormValues,
): CustomerFormValues {
  let cpf = nextValues.cpf ?? previousValues.cpf ?? "";
  let cnpj = nextValues.cnpj ?? previousValues.cnpj ?? "";
  let phone = nextValues.phone ?? previousValues.phone ?? "";

  if (nextValues.type !== previousValues.type) {
    if (nextValues.type === "individual") {
      cnpj = "";
    } else {
      cpf = "";
    }
  }

  if (nextValues.contactType !== previousValues.contactType) {
    phone = "";
  }

  return {
    ...nextValues,
    phone: formatCustomerFieldValue("phone", phone, nextValues.contactType),
    cpf: formatCustomerFieldValue("cpf", cpf, nextValues.contactType),
    cnpj: formatCustomerFieldValue("cnpj", cnpj, nextValues.contactType),
  };
}
