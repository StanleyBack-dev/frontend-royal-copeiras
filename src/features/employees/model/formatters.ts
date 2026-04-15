import {
  formatCNPJ,
  formatCPF,
  formatLandline,
  formatPhone,
} from "../../../utils/format";
import type { EmployeeFormValues } from "./form";

export function formatEmployeeDocument(value: string): string {
  const digits = value.replace(/\D/g, "");

  return digits.length > 11 ? formatCNPJ(value) : formatCPF(value);
}

export function formatEmployeeFieldValue(
  field: keyof EmployeeFormValues,
  value: string,
  contactType: EmployeeFormValues["contactType"],
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

export function normalizeEmployeeFormValues(
  nextValues: EmployeeFormValues,
  previousValues: EmployeeFormValues,
): EmployeeFormValues {
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
    phone: formatEmployeeFieldValue("phone", phone, nextValues.contactType),
    cpf: formatEmployeeFieldValue("cpf", cpf, nextValues.contactType),
    cnpj: formatEmployeeFieldValue("cnpj", cnpj, nextValues.contactType),
  };
}
