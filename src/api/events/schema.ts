import { z } from "zod";

export const eventStatusOptions = [
  "scheduled",
  "in_progress",
  "completed",
  "canceled",
] as const;

export type EventStatus = (typeof eventStatusOptions)[number];

export const EventAssignmentSchema = z.object({
  idEventAssignments: z.string(),
  idBudgetItems: z.string().nullable().optional(),
  idEmployees: z.string().nullable().optional(),
  allocationIndex: z.number(),
  employeePayment: z.number(),
  isActive: z.boolean(),
  budgetItemDescription: z.string().nullable().optional(),
  budgetItemQuantity: z.number().nullable().optional(),
  employeeName: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const EventServiceBreakdownSchema = z.object({
  idBudgetItems: z.string(),
  serviceDescription: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  totalPrice: z.number(),
  sortOrder: z.number(),
});

export const EventSchema = z.object({
  idEvents: z.string(),
  idContracts: z.string(),
  idBudgets: z.string(),
  idLeads: z.string().nullable().optional(),
  idCustomers: z.string().nullable().optional(),
  status: z.string(),
  notes: z.string().nullable().optional(),
  contractNumber: z.string().nullable().optional(),
  budgetNumber: z.string().nullable().optional(),
  customerName: z.string().nullable().optional(),
  leadName: z.string().nullable().optional(),
  eventDates: z.array(z.string()).nullable().optional(),
  eventLocation: z.string().nullable().optional(),
  displacementFee: z.number().optional().default(0),
  serviceBreakdown: z.array(EventServiceBreakdownSchema).optional().default([]),
  totalRevenue: z.number(),
  totalCost: z.number(),
  companyReceivable: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  assignments: z.array(EventAssignmentSchema).optional().default([]),
});

export const UpdateEventAssignmentPayloadSchema = z.object({
  idEmployees: z.string().optional(),
  employeePayment: z.number().optional(),
});

export type Event = z.infer<typeof EventSchema>;
export type EventAssignment = z.infer<typeof EventAssignmentSchema>;
export type UpdateEventAssignmentPayload = z.infer<
  typeof UpdateEventAssignmentPayloadSchema
>;
