import { z } from "zod";
import {
  EMPLOYEE_DOCUMENT_CNPJ_DIGITS,
  EMPLOYEE_DOCUMENT_CPF_DIGITS,
  EMPLOYEE_EMAIL_MAX_LENGTH,
  EMPLOYEE_EMAIL_MIN_LENGTH,
  EMPLOYEE_NAME_MAX_LENGTH,
  EMPLOYEE_NAME_MIN_LENGTH,
  EMPLOYEE_PHONE_LANDLINE_DIGITS,
  EMPLOYEE_PHONE_MOBILE_DIGITS,
} from "./constants";
import { employeeValidationMessages } from "./messages";

export const employeeTypeOptions = ["individual", "company"] as const;
export const employeeGenderOptions = ["", "MALE", "FEMALE"] as const;
export const employeeContactTypeOptions = ["mobile", "landline"] as const;

const employeeFormSchemaBase = z.object({
  name: z
    .string()
    .trim()
    .min(EMPLOYEE_NAME_MIN_LENGTH, employeeValidationMessages.nameRequired)
    .max(EMPLOYEE_NAME_MAX_LENGTH, employeeValidationMessages.nameMax),
  gender: z
    .enum(employeeGenderOptions)
    .refine((value) => value !== "", employeeValidationMessages.genderRequired),
  type: z.enum(employeeTypeOptions),
  contactType: z.enum(employeeContactTypeOptions),
  email: z
    .string()
    .trim()
    .min(EMPLOYEE_EMAIL_MIN_LENGTH, employeeValidationMessages.emailMin)
    .max(EMPLOYEE_EMAIL_MAX_LENGTH, employeeValidationMessages.emailMax)
    .email(employeeValidationMessages.emailInvalid)
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
  idPositions: z.string().trim().min(1, employeeValidationMessages.positionMin),
  isActive: z.boolean(),
});

export const employeeFormSchema = employeeFormSchemaBase.superRefine(
  (data, ctx) => {
    if (data.phone) {
      const phoneIsValid =
        data.contactType === "mobile"
          ? new RegExp(`^\\d{${EMPLOYEE_PHONE_MOBILE_DIGITS}}$`).test(
              data.phone,
            )
          : new RegExp(`^\\d{${EMPLOYEE_PHONE_LANDLINE_DIGITS}}$`).test(
              data.phone,
            );

      if (!phoneIsValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: employeeValidationMessages.phoneInvalid,
          path: ["phone"],
        });
      }
    }

    if (data.type === "individual" && data.cpf) {
      const cpfIsValid = new RegExp(
        `^\\d{${EMPLOYEE_DOCUMENT_CPF_DIGITS}}$`,
      ).test(data.cpf);

      if (!cpfIsValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: employeeValidationMessages.cpfInvalid,
          path: ["cpf"],
        });
      }
    }

    if (data.type === "company" && data.cnpj) {
      const cnpjIsValid = new RegExp(
        `^\\d{${EMPLOYEE_DOCUMENT_CNPJ_DIGITS}}$`,
      ).test(data.cnpj);

      if (!cnpjIsValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: employeeValidationMessages.cnpjInvalid,
          path: ["cnpj"],
        });
      }
    }
  },
);

export type EmployeeFormValues = Omit<
  z.infer<typeof employeeFormSchema>,
  "gender"
> & {
  gender: (typeof employeeGenderOptions)[number];
  createdAt: string;
};

export const emptyEmployeeFormValues: EmployeeFormValues = {
  name: "",
  cpf: "",
  cnpj: "",
  createdAt: "",
  gender: "",
  type: "individual",
  contactType: "mobile",
  email: "",
  phone: "",
  idPositions: "",
  isActive: true,
};
