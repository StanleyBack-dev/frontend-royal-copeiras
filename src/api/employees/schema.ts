import { z } from "zod";
import {
  EMPLOYEE_DOCUMENT_CNPJ_DIGITS,
  EMPLOYEE_DOCUMENT_CPF_DIGITS,
  EMPLOYEE_EMAIL_MAX_LENGTH,
  EMPLOYEE_EMAIL_MIN_LENGTH,
  EMPLOYEE_NAME_MAX_LENGTH,
  EMPLOYEE_POSITION_MAX_LENGTH,
} from "../../features/employees/model/constants";
import { employeeValidationMessages } from "../../features/employees/model/messages";

export const EmployeeSchema = z.object({
  idEmployees: z.string(),
  name: z.string().trim().min(1).max(EMPLOYEE_NAME_MAX_LENGTH),
  document: z.string().trim().optional().nullable(),
  email: z
    .string()
    .trim()
    .max(EMPLOYEE_EMAIL_MAX_LENGTH, employeeValidationMessages.emailMax)
    .email(employeeValidationMessages.emailInvalid)
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  position: z.string().trim().min(1).max(EMPLOYEE_POSITION_MAX_LENGTH),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateEmployeePayloadSchema = z.object({
  name: z.string().trim().min(1).max(EMPLOYEE_NAME_MAX_LENGTH),
  document: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => {
        if (!value) {
          return true;
        }

        const digits = value.replace(/\D/g, "");

        return (
          digits.length === EMPLOYEE_DOCUMENT_CPF_DIGITS ||
          digits.length === EMPLOYEE_DOCUMENT_CNPJ_DIGITS
        );
      },
      { message: employeeValidationMessages.documentInvalid },
    ),
  email: z
    .string()
    .trim()
    .min(EMPLOYEE_EMAIL_MIN_LENGTH, employeeValidationMessages.emailMin)
    .max(EMPLOYEE_EMAIL_MAX_LENGTH, employeeValidationMessages.emailMax)
    .email(employeeValidationMessages.emailInvalid)
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  position: z.string().trim().min(1).max(EMPLOYEE_POSITION_MAX_LENGTH),
  isActive: z.boolean().optional(),
});

export const UpdateEmployeePayloadSchema =
  CreateEmployeePayloadSchema.partial();

export type Employee = z.infer<typeof EmployeeSchema>;
export type CreateEmployeePayload = z.infer<typeof CreateEmployeePayloadSchema>;
export type UpdateEmployeePayload = z.infer<typeof UpdateEmployeePayloadSchema>;
