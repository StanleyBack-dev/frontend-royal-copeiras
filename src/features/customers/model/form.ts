import { z } from "zod";
import {
  CUSTOMER_ADDRESS_MAX_LENGTH,
  CUSTOMER_ADDRESS_MIN_LENGTH,
  CUSTOMER_CNPJ_DIGITS,
  CUSTOMER_CPF_DIGITS,
  CUSTOMER_EMAIL_MAX_LENGTH,
  CUSTOMER_EMAIL_MIN_LENGTH,
  CUSTOMER_LANDLINE_DIGITS,
  CUSTOMER_MOBILE_DIGITS,
  CUSTOMER_NAME_MAX_LENGTH,
  CUSTOMER_NAME_MIN_LENGTH,
} from "./constants";
import { customerValidationMessages } from "./messages";

export const customerTypeOptions = ["individual", "company"] as const;
export const customerContactTypeOptions = ["mobile", "landline"] as const;

const customerFormSchemaBase = z.object({
  name: z
    .string()
    .trim()
    .min(CUSTOMER_NAME_MIN_LENGTH, customerValidationMessages.nameRequired)
    .max(CUSTOMER_NAME_MAX_LENGTH, customerValidationMessages.nameMax),
  type: z.enum(customerTypeOptions),
  contactType: z.enum(customerContactTypeOptions),
  isActive: z.boolean(),
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
  email: z
    .string()
    .trim()
    .min(CUSTOMER_EMAIL_MIN_LENGTH, customerValidationMessages.emailMin)
    .max(CUSTOMER_EMAIL_MAX_LENGTH, customerValidationMessages.emailMax)
    .email(customerValidationMessages.emailInvalid)
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z
    .string()
    .trim()
    .min(CUSTOMER_ADDRESS_MIN_LENGTH, customerValidationMessages.addressMin)
    .max(CUSTOMER_ADDRESS_MAX_LENGTH, customerValidationMessages.addressMax)
    .optional()
    .or(z.literal("")),
});

export const customerFormSchema = customerFormSchemaBase.superRefine(
  (data, ctx) => {
    if (data.phone) {
      const phoneIsValid =
        data.contactType === "mobile"
          ? new RegExp(`^\\d{${CUSTOMER_MOBILE_DIGITS}}$`).test(data.phone)
          : new RegExp(`^\\d{${CUSTOMER_LANDLINE_DIGITS}}$`).test(data.phone);

      if (!phoneIsValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: customerValidationMessages.phoneInvalid,
          path: ["phone"],
        });
      }
    }

    if (data.type === "individual" && data.cpf) {
      const cpfIsValid = new RegExp(`^\\d{${CUSTOMER_CPF_DIGITS}}$`).test(
        data.cpf,
      );

      if (!cpfIsValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: customerValidationMessages.cpfInvalid,
          path: ["cpf"],
        });
      }
    }

    if (data.type === "company" && data.cnpj) {
      const cnpjIsValid = new RegExp(`^\\d{${CUSTOMER_CNPJ_DIGITS}}$`).test(
        data.cnpj,
      );

      if (!cnpjIsValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: customerValidationMessages.cnpjInvalid,
          path: ["cnpj"],
        });
      }
    }
  },
);

export type CustomerFormValues = z.infer<typeof customerFormSchema> & {
  createdAt: string;
};

export const emptyCustomerFormValues: CustomerFormValues = {
  name: "",
  cpf: "",
  cnpj: "",
  createdAt: "",
  type: "individual",
  contactType: "mobile",
  email: "",
  phone: "",
  address: "",
  isActive: true,
};
