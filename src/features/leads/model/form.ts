import { z } from "zod";
import {
  leadSourceOptions,
  leadStatusOptions,
} from "../../../api/leads/schema";
import {
  LEAD_DOCUMENT_DIGITS_CNPJ,
  LEAD_DOCUMENT_DIGITS_CPF,
  LEAD_EMAIL_MAX_LENGTH,
  LEAD_EMAIL_MIN_LENGTH,
  LEAD_NAME_MAX_LENGTH,
  LEAD_NAME_MIN_LENGTH,
  LEAD_PHONE_LANDLINE_DIGITS,
  LEAD_PHONE_MOBILE_DIGITS,
} from "./constants";
import { leadValidationMessages } from "./messages";

export const leadTypeOptions = ["individual", "company"] as const;
export const leadContactTypeOptions = ["mobile", "landline"] as const;

const leadFormSchemaBase = z.object({
  name: z
    .string()
    .trim()
    .min(LEAD_NAME_MIN_LENGTH, leadValidationMessages.nameRequired)
    .max(LEAD_NAME_MAX_LENGTH, leadValidationMessages.nameMax),
  email: z
    .string()
    .trim()
    .min(LEAD_EMAIL_MIN_LENGTH, leadValidationMessages.emailMin)
    .max(LEAD_EMAIL_MAX_LENGTH, leadValidationMessages.emailMax)
    .email(leadValidationMessages.emailInvalid)
    .optional()
    .or(z.literal("")),
  type: z.enum(leadTypeOptions),
  contactType: z.enum(leadContactTypeOptions),
  phone: z.string().optional().or(z.literal("")),
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
  source: z.enum(leadSourceOptions).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  status: z.enum(leadStatusOptions),
  isActive: z.boolean(),
});

export const leadFormSchema = leadFormSchemaBase.superRefine((data, ctx) => {
  if (data.phone) {
    const phoneIsValid =
      data.contactType === "mobile"
        ? new RegExp(`^\\d{${LEAD_PHONE_MOBILE_DIGITS}}$`).test(data.phone)
        : new RegExp(`^\\d{${LEAD_PHONE_LANDLINE_DIGITS}}$`).test(data.phone);

    if (!phoneIsValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: leadValidationMessages.phoneInvalid,
        path: ["phone"],
      });
    }
  }

  if (data.type === "individual" && data.cpf) {
    const cpfIsValid = new RegExp(`^\\d{${LEAD_DOCUMENT_DIGITS_CPF}}$`).test(
      data.cpf,
    );

    if (!cpfIsValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: leadValidationMessages.cpfInvalid,
        path: ["cpf"],
      });
    }
  }

  if (data.type === "company" && data.cnpj) {
    const cnpjIsValid = new RegExp(`^\\d{${LEAD_DOCUMENT_DIGITS_CNPJ}}$`).test(
      data.cnpj,
    );

    if (!cnpjIsValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: leadValidationMessages.cnpjInvalid,
        path: ["cnpj"],
      });
    }
  }
});

export type LeadFormValues = z.infer<typeof leadFormSchema> & {
  createdAt: string;
};

export const emptyLeadFormValues: LeadFormValues = {
  name: "",
  email: "",
  type: "individual",
  contactType: "mobile",
  phone: "",
  cpf: "",
  cnpj: "",
  source: "",
  notes: "",
  status: "new",
  isActive: true,
  createdAt: "",
};
