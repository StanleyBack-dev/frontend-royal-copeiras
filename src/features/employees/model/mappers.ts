import type {
  CreateEmployeePayload,
  Employee,
} from "../../../api/employees/schema";
import { formatDateTimeDisplay, onlyDigits } from "../../../utils/format";
import {
  EMPLOYEE_DOCUMENT_CNPJ_DIGITS,
  EMPLOYEE_DOCUMENT_CPF_DIGITS,
  EMPLOYEE_PHONE_LANDLINE_DIGITS,
  EMPLOYEE_PHONE_MOBILE_DIGITS,
} from "./constants";
import type { EmployeeFormValues } from "./form";

export function inferEmployeeContactType(phone?: string) {
  return onlyDigits(phone || "").length > EMPLOYEE_PHONE_LANDLINE_DIGITS
    ? "mobile"
    : "landline";
}

export function inferEmployeeDocumentType(document?: string) {
  return onlyDigits(document || "").length > EMPLOYEE_DOCUMENT_CPF_DIGITS
    ? "company"
    : "individual";
}

export function mapEmployeeToFormValues(
  employee: Employee,
): EmployeeFormValues {
  const type = inferEmployeeDocumentType(employee.document);

  return {
    name: employee.name,
    cpf: type === "individual" ? employee.document : "",
    cnpj: type === "company" ? employee.document : "",
    createdAt: formatDateTimeDisplay(employee.createdAt),
    type,
    contactType: inferEmployeeContactType(employee.phone),
    email: employee.email || "",
    phone: employee.phone || "",
    position: employee.position,
    isActive: employee.isActive,
  };
}

export function mapEmployeeFormToValidationInput(values: EmployeeFormValues) {
  return {
    name: values.name,
    cpf:
      values.type === "individual"
        ? onlyDigits(values.cpf ?? "", EMPLOYEE_DOCUMENT_CPF_DIGITS)
        : undefined,
    cnpj:
      values.type === "company"
        ? onlyDigits(values.cnpj ?? "", EMPLOYEE_DOCUMENT_CNPJ_DIGITS)
        : undefined,
    type: values.type,
    contactType: values.contactType,
    email: values.email,
    phone:
      values.contactType === "mobile"
        ? onlyDigits(values.phone ?? "", EMPLOYEE_PHONE_MOBILE_DIGITS)
        : onlyDigits(values.phone ?? "", EMPLOYEE_PHONE_LANDLINE_DIGITS),
    position: values.position,
    isActive: values.isActive,
  };
}

export function mapEmployeeFormToPayload(
  values: EmployeeFormValues,
): CreateEmployeePayload {
  return {
    name: values.name,
    document:
      values.type === "individual"
        ? onlyDigits(values.cpf ?? "", EMPLOYEE_DOCUMENT_CPF_DIGITS)
        : onlyDigits(values.cnpj ?? "", EMPLOYEE_DOCUMENT_CNPJ_DIGITS),
    email: values.email,
    phone:
      values.contactType === "mobile"
        ? onlyDigits(values.phone ?? "", EMPLOYEE_PHONE_MOBILE_DIGITS)
        : onlyDigits(values.phone ?? "", EMPLOYEE_PHONE_LANDLINE_DIGITS),
    position: values.position,
    isActive: values.isActive,
  };
}
