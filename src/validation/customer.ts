import { z } from "zod";

export const customerSchema = z
  .object({
    name: z.string().trim().min(2, "Nome obrigatório").max(120),
    type: z.enum(["individual", "company"]),
    contactType: z.enum(["mobile", "landline"]),
    isActive: z.boolean(),
    cpf: z.string().optional(),
    cnpj: z.string().optional(),
    email: z
      .string()
      .trim()
      .min(6, "E-mail deve ter pelo menos 6 caracteres")
      .max(120, "E-mail deve ter no máximo 120 caracteres")
      .email("E-mail inválido")
      .optional()
      .or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    address: z
      .string()
      .trim()
      .min(8, "Endereço deve ter pelo menos 8 caracteres")
      .max(255, "Endereço deve ter no máximo 255 caracteres")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (!data.phone) {
        return true;
      }
      if (data.contactType === "mobile") {
        return /^\d{11}$/.test(data.phone);
      }
      return /^\d{10}$/.test(data.phone);
    },
    {
      message: "Telefone móvel deve ter 11 dígitos e fixo deve ter 10 dígitos",
      path: ["phone"],
    },
  )
  .refine(
    (data) => {
      if (data.type === "individual" && data.cpf) {
        return /^\d{11}$/.test(data.cpf);
      }
      if (data.type === "company" && data.cnpj) {
        return /^\d{14}$/.test(data.cnpj);
      }
      return true;
    },
    {
      message: "CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos",
      path: ["document"],
    },
  );

export type CustomerFormValues = z.infer<typeof customerSchema>;
