import { z } from "zod";

export const CustomerSchema = z.object({
  idCustomers: z.string(),
  name: z.string().trim().min(1).max(120),
  document: z.string().trim().min(1),
  type: z.enum(["individual", "company"]),
  email: z
    .string()
    .trim()
    .min(11, "E-mail deve ter pelo menos 11 caracteres")
    .max(120, "E-mail deve ter no máximo 120 caracteres")
    .email("E-mail inválido")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos")
    .optional()
    .or(z.literal("")),
  address: z.string().trim().min(8).max(255).optional().or(z.literal("")),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});


export const CreateCustomerPayloadSchema = CustomerSchema.omit({
  idCustomers: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  document: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export type Customer = z.infer<typeof CustomerSchema>;
export type CreateCustomerPayload = z.infer<typeof CreateCustomerPayloadSchema>;
