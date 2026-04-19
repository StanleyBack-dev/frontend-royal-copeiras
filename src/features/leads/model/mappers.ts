import type { CreateLeadPayload, Lead } from "../../../api/leads/schema";
import { formatDateTimeDisplay, onlyDigits } from "../../../utils/format";
import {
  LEAD_DOCUMENT_DIGITS_CNPJ,
  LEAD_DOCUMENT_DIGITS_CPF,
  LEAD_PHONE_LANDLINE_DIGITS,
  LEAD_PHONE_MOBILE_DIGITS,
} from "./constants";
import type { LeadFormValues } from "./form";

export function inferLeadContactType(phone?: string) {
  return onlyDigits(phone || "").length > LEAD_PHONE_LANDLINE_DIGITS
    ? "mobile"
    : "landline";
}

export function inferLeadDocumentType(document?: string) {
  return onlyDigits(document || "").length > LEAD_DOCUMENT_DIGITS_CPF
    ? "company"
    : "individual";
}

export function mapLeadToFormValues(lead: Lead): LeadFormValues {
  const type = inferLeadDocumentType(lead.document);

  return {
    name: lead.name,
    email: lead.email || "",
    type,
    contactType: inferLeadContactType(lead.phone),
    phone: lead.phone || "",
    cpf: type === "individual" ? lead.document || "" : "",
    cnpj: type === "company" ? lead.document || "" : "",
    source: lead.source || "",
    notes: lead.notes || "",
    status: lead.status,
    isActive: lead.isActive,
    createdAt: formatDateTimeDisplay(lead.createdAt),
  };
}

export function mapLeadFormToPayload(
  values: LeadFormValues,
): CreateLeadPayload {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    phone:
      values.contactType === "mobile"
        ? onlyDigits(values.phone ?? "", LEAD_PHONE_MOBILE_DIGITS)
        : onlyDigits(values.phone ?? "", LEAD_PHONE_LANDLINE_DIGITS),
    document:
      values.type === "individual"
        ? onlyDigits(values.cpf ?? "", LEAD_DOCUMENT_DIGITS_CPF)
        : onlyDigits(values.cnpj ?? "", LEAD_DOCUMENT_DIGITS_CNPJ),
    source: values.source.trim(),
    notes: values.notes.trim(),
    status: values.status,
    isActive: values.isActive,
  };
}

export function mapLeadFormToValidationInput(values: LeadFormValues) {
  return {
    name: values.name.trim(),
    type: values.type,
    contactType: values.contactType,
    email: values.email.trim(),
    phone:
      values.contactType === "mobile"
        ? onlyDigits(values.phone ?? "", LEAD_PHONE_MOBILE_DIGITS)
        : onlyDigits(values.phone ?? "", LEAD_PHONE_LANDLINE_DIGITS),
    cpf:
      values.type === "individual"
        ? onlyDigits(values.cpf ?? "", LEAD_DOCUMENT_DIGITS_CPF)
        : undefined,
    cnpj:
      values.type === "company"
        ? onlyDigits(values.cnpj ?? "", LEAD_DOCUMENT_DIGITS_CNPJ)
        : undefined,
    source: values.source.trim(),
    notes: values.notes.trim(),
    status: values.status,
    isActive: values.isActive,
  };
}
