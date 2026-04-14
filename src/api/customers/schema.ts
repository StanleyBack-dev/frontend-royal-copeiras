import { z } from "zod";

export const CustomerSchema = z.object({
  idCustomers: z.string(),
  name: z.string().min(1),
  document: z.string().min(1),
  type: z.enum(["individual", "company"]),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateCustomerPayloadSchema = CustomerSchema.omit({
  idCustomers: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  isActive: z.boolean().optional(),
});

export type Customer = z.infer<typeof CustomerSchema>;
export type CreateCustomerPayload = z.infer<typeof CreateCustomerPayloadSchema>;
