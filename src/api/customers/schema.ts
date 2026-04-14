import { z } from "zod";
import {
  CUSTOMER_EMAIL_MAX_LENGTH,
  CUSTOMER_EMAIL_MIN_LENGTH,
  CUSTOMER_NAME_MAX_LENGTH,
} from "../../features/customers/model/constants";
import { customerValidationMessages } from "../../features/customers/model/messages";

export const CustomerSchema = z.object({
  idCustomers: z.string(),
  name: z.string().trim().min(1).max(CUSTOMER_NAME_MAX_LENGTH),
  document: z.string().trim().optional().or(z.literal("")),
  type: z.enum(["individual", "company"]),
  email: z
    .string()
    .trim()
    .max(
      CUSTOMER_EMAIL_MAX_LENGTH,
      customerValidationMessages.emailMax,
    )
    .email(customerValidationMessages.emailInvalid)
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateCustomerPayloadSchema = z.object({
  name: z.string().trim().min(1).max(CUSTOMER_NAME_MAX_LENGTH),
  document: z.string().optional().or(z.literal("")),
  type: z.enum(["individual", "company"]),
  email: z
    .string()
    .trim()
    .min(
      CUSTOMER_EMAIL_MIN_LENGTH,
      customerValidationMessages.emailMin,
    )
    .max(
      CUSTOMER_EMAIL_MAX_LENGTH,
      customerValidationMessages.emailMax,
    )
    .email(customerValidationMessages.emailInvalid)
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export const UpdateCustomerPayloadSchema = CreateCustomerPayloadSchema.partial();

export type Customer = z.infer<typeof CustomerSchema>;
export type CreateCustomerPayload = z.infer<typeof CreateCustomerPayloadSchema>;
export type UpdateCustomerPayload = z.infer<typeof UpdateCustomerPayloadSchema>;
