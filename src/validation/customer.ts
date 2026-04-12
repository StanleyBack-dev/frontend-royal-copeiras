import { z } from 'zod';


export const customerSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório').max(120),
  type: z.enum(['individual', 'company'], 'Tipo obrigatório'),
  isActive: z.boolean(),
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  birthDate: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
}).refine((data) => {
  if (data.type === 'individual') {
    return !!data.cpf && /^\d{11}$/.test(data.cpf);
  }
  if (data.type === 'company') {
    return !!data.cnpj && /^\d{14}$/.test(data.cnpj);
  }
  return true;
}, {
  message: 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos',
  path: ['document'],
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
