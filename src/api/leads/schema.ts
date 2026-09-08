import { z } from "zod";

// The API returns explicit `null` for unset nullable columns (e.g. a lead
// created without a document/notes); these fields otherwise only expect a
// string, `undefined`, or `""`.
function nullableToUndefined<TSchema extends z.ZodTypeAny>(schema: TSchema) {
  return z.preprocess((value) => (value == null ? undefined : value), schema);
}

export const leadStatusOptions = ["new", "qualified", "won", "lost"] as const;
export const leadSourceOptions = [
  "instagram",
  "referral",
  "website",
  "whatsapp",
  "event",
  "public_form",
  "other",
] as const;

export const LeadSchema = z.object({
  idLeads: z.string(),
  name: z.string().trim().min(1).max(120),
  email: nullableToUndefined(
    z.string().trim().email().optional().or(z.literal("")),
  ),
  phone: nullableToUndefined(z.string().optional().or(z.literal(""))),
  document: nullableToUndefined(z.string().optional().or(z.literal(""))),
  legalName: nullableToUndefined(z.string().optional().or(z.literal(""))),
  address: nullableToUndefined(z.string().optional().or(z.literal(""))),
  addressCity: nullableToUndefined(z.string().optional().or(z.literal(""))),
  addressState: nullableToUndefined(z.string().optional().or(z.literal(""))),
  addressZipCode: nullableToUndefined(z.string().optional().or(z.literal(""))),
  source: nullableToUndefined(
    z.enum(leadSourceOptions).optional().or(z.literal("")),
  ),
  notes: nullableToUndefined(z.string().optional().or(z.literal(""))),
  status: z.enum(leadStatusOptions),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateLeadPayloadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  document: z.string().optional().or(z.literal("")),
  legalName: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  addressCity: z.string().optional().or(z.literal("")),
  addressState: z.string().optional().or(z.literal("")),
  addressZipCode: z.string().optional().or(z.literal("")),
  source: z.enum(leadSourceOptions).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  status: z.enum(leadStatusOptions).optional(),
  isActive: z.boolean().optional(),
});

export const UpdateLeadPayloadSchema = CreateLeadPayloadSchema.partial();

export type Lead = z.infer<typeof LeadSchema>;
export type LeadStatus = (typeof leadStatusOptions)[number];
export type LeadSource = (typeof leadSourceOptions)[number];
export type CreateLeadPayload = z.infer<typeof CreateLeadPayloadSchema>;
export type UpdateLeadPayload = z.infer<typeof UpdateLeadPayloadSchema>;
