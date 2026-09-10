import {
  formatCEP,
  formatCNPJ,
  formatCPF,
  formatLandline,
  formatPhone,
} from "../../../utils/format";
import type { LeadFormValues } from "./form";

export function normalizeLeadFormValues(
  nextValues: LeadFormValues,
  previousValues: LeadFormValues = nextValues,
): LeadFormValues {
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

  // "Sem número" toggle drives the number field: forces "S/N" when checked,
  // clears it when just unchecked so the user types a real number.
  let addressNumber = nextValues.addressNumber ?? "";
  if (nextValues.addressNoNumber) {
    addressNumber = "S/N";
  } else if (previousValues.addressNoNumber) {
    addressNumber = "";
  }

  return {
    ...nextValues,
    phone:
      nextValues.contactType === "landline"
        ? formatLandline(phone)
        : formatPhone(phone),
    cpf: formatCPF(cpf),
    cnpj: formatCNPJ(cnpj),
    addressNumber,
    addressZipCode: formatCEP(nextValues.addressZipCode ?? ""),
    name: nextValues.name.trimStart(),
    email: (nextValues.email ?? "").trim(),
    source: nextValues.source ?? "",
  };
}
