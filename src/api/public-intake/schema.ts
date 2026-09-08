import { z } from "zod";

export const publicIntakeCodeStatusOptions = [
  "pending",
  "verified",
  "submitted",
  "expired",
  "invalidated",
] as const;

export const GeneratedPublicIntakeCodeSchema = z.object({
  code: z.string(),
  expiresAt: z.string(),
});

export const VerifiedPublicIntakeCodeSchema = z.object({
  formToken: z.string(),
  expiresAt: z.string(),
});

export const SubmittedPublicIntakeSchema = z.object({
  idLeads: z.string(),
  idBudgets: z.string(),
});

export const PublicIntakeCodeListItemSchema = z.object({
  idPublicIntakeCodes: z.string(),
  code: z.string(),
  status: z.enum(publicIntakeCodeStatusOptions),
  expiresAt: z.string(),
  resultingLeadId: z.string().nullable().optional(),
  resultingBudgetId: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const SubmitPublicIntakeItemPayloadSchema = z.object({
  description: z.string().trim().min(1),
  gender: z.enum(["Masculino", "Feminino"]).optional(),
  quantity: z.number().int().min(1),
  eventDateIndex: z.number().int().min(0).default(0),
});

export const SubmitPublicIntakePayloadSchema = z.object({
  formToken: z.string(),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  document: z.string().optional().or(z.literal("")),
  eventDates: z.array(z.string()).min(1),
  eventArrivalTimes: z.array(z.string()).min(1),
  eventDepartureTimes: z.array(z.string()).min(1),
  eventLocation: z.array(z.string().trim().min(1)).min(1),
  guestCount: z.array(z.number().int().min(1)).min(1),
  durationHours: z.array(z.number().int().min(1).max(24)).min(1),
  items: z.array(SubmitPublicIntakeItemPayloadSchema).min(1),
});

export type GeneratedPublicIntakeCode = z.infer<
  typeof GeneratedPublicIntakeCodeSchema
>;
export type VerifiedPublicIntakeCode = z.infer<
  typeof VerifiedPublicIntakeCodeSchema
>;
export type SubmittedPublicIntake = z.infer<typeof SubmittedPublicIntakeSchema>;
export type PublicIntakeCodeListItem = z.infer<
  typeof PublicIntakeCodeListItemSchema
>;
export type PublicIntakeCodeStatus =
  (typeof publicIntakeCodeStatusOptions)[number];
export type SubmitPublicIntakePayload = z.infer<
  typeof SubmitPublicIntakePayloadSchema
>;
