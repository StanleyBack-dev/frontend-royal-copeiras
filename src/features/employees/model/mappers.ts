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

function resolveGender(values: EmployeeFormValues): "MALE" | "FEMALE" {
  if (values.gender === "MALE" || values.gender === "FEMALE") {
    return values.gender;
  }

  throw new Error("Genero invalido");
}

export function inferEmployeeContactType(phone?: string | null) {
  return onlyDigits(phone || "").length > EMPLOYEE_PHONE_LANDLINE_DIGITS
    ? "mobile"
    : "landline";
}

export function inferEmployeeDocumentType(document?: string | null) {
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
    gender: (employee.gender ?? "") as EmployeeFormValues["gender"],
    cpf: type === "individual" ? (employee.document ?? "") : "",
    cnpj: type === "company" ? (employee.document ?? "") : "",
    createdAt: formatDateTimeDisplay(employee.createdAt),
    type,
    contactType: inferEmployeeContactType(employee.phone),
    email: employee.email || "",
    phone: employee.phone || "",
    idPositions: employee.idPositions,
    isActive: employee.isActive,
  };
}

export function mapEmployeeFormToValidationInput(values: EmployeeFormValues) {
  return {
    name: values.name,
    gender: resolveGender(values),
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
    idPositions: values.idPositions,
    isActive: values.isActive,
  };
}

export function mapEmployeeFormToPayload(
  values: EmployeeFormValues,
): CreateEmployeePayload {
  const document =
    values.type === "individual"
      ? onlyDigits(values.cpf ?? "", EMPLOYEE_DOCUMENT_CPF_DIGITS)
      : onlyDigits(values.cnpj ?? "", EMPLOYEE_DOCUMENT_CNPJ_DIGITS);

  return {
    name: values.name,
    gender: resolveGender(values),
    document: document || undefined,
    email: values.email,
    phone:
      values.contactType === "mobile"
        ? onlyDigits(values.phone ?? "", EMPLOYEE_PHONE_MOBILE_DIGITS)
        : onlyDigits(values.phone ?? "", EMPLOYEE_PHONE_LANDLINE_DIGITS),
    idPositions: values.idPositions,
    isActive: values.isActive,
  };
}
