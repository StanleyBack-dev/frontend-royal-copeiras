import { z } from "zod";

const POSITION_NAME_MIN_LENGTH = 2;
const POSITION_NAME_MAX_LENGTH = 120;

export const PositionSchema = z.object({
  idPositions: z.string(),
  name: z.string().trim().min(1).max(POSITION_NAME_MAX_LENGTH),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreatePositionPayloadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      POSITION_NAME_MIN_LENGTH,
      `Nome deve ter pelo menos ${POSITION_NAME_MIN_LENGTH} caracteres`,
    )
    .max(
      POSITION_NAME_MAX_LENGTH,
      `Nome deve ter no máximo ${POSITION_NAME_MAX_LENGTH} caracteres`,
    ),
  isActive: z.boolean().optional(),
});

export const UpdatePositionPayloadSchema =
  CreatePositionPayloadSchema.partial();

export type Position = z.infer<typeof PositionSchema>;
export type CreatePositionPayload = z.infer<typeof CreatePositionPayloadSchema>;
export type UpdatePositionPayload = z.infer<typeof UpdatePositionPayloadSchema>;
