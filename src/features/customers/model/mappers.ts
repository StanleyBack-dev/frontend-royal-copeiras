import type {
  CreateCustomerPayload,
  Customer,
} from "../../../api/customers/schema";
import { formatDateTimeDisplay, onlyDigits } from "../../../utils/format";
import {
  CUSTOMER_CNPJ_DIGITS,
  CUSTOMER_CPF_DIGITS,
  CUSTOMER_LANDLINE_DIGITS,
  CUSTOMER_MOBILE_DIGITS,
} from "./constants";
import type { CustomerFormValues } from "./form";

export function inferCustomerContactType(phone?: string) {
  return onlyDigits(phone || "").length > CUSTOMER_LANDLINE_DIGITS
    ? "mobile"
    : "landline";
}

export function mapCustomerToFormValues(
  customer: Customer,
): CustomerFormValues {
  return {
    name: customer.name,
    cpf: customer.type === "individual" ? customer.document : "",
    cnpj: customer.type === "company" ? customer.document : "",
    createdAt: formatDateTimeDisplay(customer.createdAt),
    type: customer.type,
    contactType: inferCustomerContactType(customer.phone),
    email: customer.email || "",
    phone: customer.phone || "",
    address: customer.address || "",
    isActive: customer.isActive,
  };
}

export function mapCustomerFormToValidationInput(values: CustomerFormValues) {
  return {
    cpf:
      values.type === "individual"
        ? onlyDigits(values.cpf ?? "", CUSTOMER_CPF_DIGITS)
        : undefined,
    cnpj:
      values.type === "company"
        ? onlyDigits(values.cnpj ?? "", CUSTOMER_CNPJ_DIGITS)
        : undefined,
    name: values.name,
    type: values.type,
    contactType: values.contactType,
    email: values.email,
    phone:
      values.contactType === "mobile"
        ? onlyDigits(values.phone ?? "", CUSTOMER_MOBILE_DIGITS)
        : onlyDigits(values.phone ?? "", CUSTOMER_LANDLINE_DIGITS),
    address: values.address,
    isActive: values.isActive,
  };
}

export function mapCustomerFormToPayload(
  values: CustomerFormValues,
): CreateCustomerPayload {
  return {
    name: values.name,
    document:
      values.type === "individual"
        ? onlyDigits(values.cpf ?? "", CUSTOMER_CPF_DIGITS)
        : onlyDigits(values.cnpj ?? "", CUSTOMER_CNPJ_DIGITS),
    type: values.type,
    email: values.email,
    phone:
      values.contactType === "mobile"
        ? onlyDigits(values.phone ?? "", CUSTOMER_MOBILE_DIGITS)
        : onlyDigits(values.phone ?? "", CUSTOMER_LANDLINE_DIGITS),
    address: values.address,
    isActive: values.isActive,
  };
}
