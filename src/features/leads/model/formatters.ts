import {
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

  return {
    ...nextValues,
    phone:
      nextValues.contactType === "landline"
        ? formatLandline(phone)
        : formatPhone(phone),
    cpf: formatCPF(cpf),
    cnpj: formatCNPJ(cnpj),
    name: nextValues.name.trimStart(),
    email: (nextValues.email ?? "").trim(),
    source: nextValues.source ?? "",
  };
}
