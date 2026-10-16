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
  overtimeHourlyPayment: z.number(),
  isActive: z.boolean(),
  budgetItemDescription: z.string().nullable().optional(),
  budgetItemQuantity: z.number().nullable().optional(),
  eventDateIndex: z.number().int().min(0).optional().default(0),
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
  eventDateIndex: z.number().int().min(0).optional().default(0),
});

export const eventExtraExpenseCategoryOptions = [
  "FOOD",
  "TRANSPORT",
  "FUEL",
  "PARKING",
  "TOLL",
  "SUPPLIES",
  "OTHER",
] as const;

export type EventExtraExpenseCategory =
  (typeof eventExtraExpenseCategoryOptions)[number];

export const EventExtraExpenseSchema = z.object({
  category: z.enum(eventExtraExpenseCategoryOptions),
  amount: z.number(),
});

export const EventSchema = z.object({
  idEvents: z.string(),
  eventNumber: z.string().nullable().optional(),
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
  eventArrivalTimes: z.array(z.string()).optional().default([]),
  eventDepartureTimes: z.array(z.string()).optional().default([]),
  eventLocationPerDay: z.array(z.string()).optional().default([]),
  guestCountPerDay: z.array(z.number()).optional().default([]),
  durationHoursPerDay: z.array(z.number()).optional().default([]),
  displacementFee: z.number().optional().default(0),
  discountTotal: z.number().optional().default(0),
  overtimeMinutes: z.number().int().min(0).optional().default(0),
  overtimeHourlyRate: z.number(),
  overtimeAmount: z.number().optional().default(0),
  overtimeCost: z.number().optional().default(0),
  extraExpenses: z.array(EventExtraExpenseSchema).optional().default([]),
  extraExpensesTotal: z.number().optional().default(0),
  serviceBreakdown: z.array(EventServiceBreakdownSchema).optional().default([]),
  totalRevenue: z.number(),
  totalCost: z.number(),
  companyReceivable: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  assignments: z.array(EventAssignmentSchema).optional().default([]),
});

export const UpdateEventAssignmentPayloadSchema = z.object({
  idEmployees: z.string().min(1),
  employeePayment: z.number(),
  overtimeHourlyPayment: z.number().min(0).optional(),
});

export const UpdateEventPayloadSchema = z.object({
  overtimeMinutes: z.number().int().min(0).optional(),
  overtimeHourlyRate: z.number().min(0).optional(),
  extraExpenses: z.array(EventExtraExpenseSchema).optional(),
  status: z.enum(eventStatusOptions).optional(),
});

export type Event = z.infer<typeof EventSchema>;
export type EventAssignment = z.infer<typeof EventAssignmentSchema>;
export type EventExtraExpense = z.infer<typeof EventExtraExpenseSchema>;
export type UpdateEventAssignmentPayload = z.infer<
  typeof UpdateEventAssignmentPayloadSchema
>;
export type UpdateEventPayload = z.infer<typeof UpdateEventPayloadSchema>;
