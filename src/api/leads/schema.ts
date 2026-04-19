import { z } from "zod";

export const leadStatusOptions = ["new", "qualified", "won", "lost"] as const;
export const leadSourceOptions = [
  "instagram",
  "referral",
  "website",
  "whatsapp",
  "event",
  "other",
] as const;

export const LeadSchema = z.object({
  idLeads: z.string(),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  document: z.string().optional().or(z.literal("")),
  source: z.enum(leadSourceOptions).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
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
