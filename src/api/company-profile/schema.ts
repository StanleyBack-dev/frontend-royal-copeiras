import { z } from "zod";

const nullableToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value == null ? undefined : value), schema);

const optionalText = () =>
  nullableToUndefined(z.string().optional().or(z.literal("")));

export const PIX_KEY_TYPE_OPTIONS = [
  "cnpj",
  "cpf",
  "email",
  "phone",
  "random",
] as const;

export const CompanyProfileSchema = z.object({
  idCompanyProfile: z.string(),
  legalName: z.string(),
  tradeName: z.string(),
  document: z.string(),
  stateRegistration: optionalText(),
  municipalRegistration: optionalText(),
  email: optionalText(),
  phone: optionalText(),
  address: optionalText(),
  addressCity: optionalText(),
  addressState: optionalText(),
  addressZipCode: optionalText(),
  representativeName: optionalText(),
  representativeRole: optionalText(),
  representativeDocument: optionalText(),
  pixKey: optionalText(),
  pixKeyType: optionalText(),
  issueCity: optionalText(),
  website: optionalText(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const UpdateCompanyProfilePayloadSchema = z.object({
  legalName: z.string().trim().min(2).max(160),
  tradeName: z.string().trim().min(2).max(160),
  document: z.string().trim().min(11).max(20),
  stateRegistration: z.string().trim().max(30).optional().or(z.literal("")),
  municipalRegistration: z.string().trim().max(30).optional().or(z.literal("")),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  address: z.string().trim().max(255).optional().or(z.literal("")),
  addressCity: z.string().trim().max(80).optional().or(z.literal("")),
  addressState: z.string().trim().max(2).optional().or(z.literal("")),
  addressZipCode: z.string().trim().max(9).optional().or(z.literal("")),
  representativeName: z.string().trim().max(120).optional().or(z.literal("")),
  representativeRole: z.string().trim().max(80).optional().or(z.literal("")),
  representativeDocument: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal("")),
  pixKey: z.string().trim().max(120).optional().or(z.literal("")),
  pixKeyType: z.enum(PIX_KEY_TYPE_OPTIONS).optional().or(z.literal("")),
  issueCity: z.string().trim().max(80).optional().or(z.literal("")),
  website: z.string().trim().max(120).optional().or(z.literal("")),
});

export type CompanyProfile = z.infer<typeof CompanyProfileSchema>;
export type UpdateCompanyProfilePayload = z.infer<
  typeof UpdateCompanyProfilePayloadSchema
>;
export type PixKeyType = (typeof PIX_KEY_TYPE_OPTIONS)[number];
