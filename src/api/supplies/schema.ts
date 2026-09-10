import { z } from "zod";

const SUPPLY_NAME_MIN_LENGTH = 2;
const SUPPLY_NAME_MAX_LENGTH = 120;

const nullableStringToOptional = () =>
  z.preprocess(
    (value) => (value == null ? undefined : value),
    z.string().optional(),
  );

const nullableNumberToOptional = () =>
  z.preprocess(
    (value) => (value == null ? undefined : value),
    z.number().optional(),
  );

export const SupplySchema = z.object({
  idSupplies: z.string(),
  name: z.string().trim().min(1).max(SUPPLY_NAME_MAX_LENGTH),
  defaultUnit: nullableStringToOptional(),
  suggestedUnitPrice: nullableNumberToOptional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateSupplyPayloadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      SUPPLY_NAME_MIN_LENGTH,
      `Nome deve ter pelo menos ${SUPPLY_NAME_MIN_LENGTH} caracteres`,
    )
    .max(
      SUPPLY_NAME_MAX_LENGTH,
      `Nome deve ter no máximo ${SUPPLY_NAME_MAX_LENGTH} caracteres`,
    ),
  defaultUnit: z.string().trim().max(32).optional().or(z.literal("")),
  suggestedUnitPrice: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const UpdateSupplyPayloadSchema = CreateSupplyPayloadSchema.partial();

export type Supply = z.infer<typeof SupplySchema>;
export type CreateSupplyPayload = z.infer<typeof CreateSupplyPayloadSchema>;
export type UpdateSupplyPayload = z.infer<typeof UpdateSupplyPayloadSchema>;
