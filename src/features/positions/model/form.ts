import { z } from "zod";
import {
  POSITION_NAME_MAX_LENGTH,
  POSITION_NAME_MIN_LENGTH,
} from "./constants";
import { positionValidationMessages } from "./messages";

export const positionFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(POSITION_NAME_MIN_LENGTH, positionValidationMessages.nameMin)
    .max(POSITION_NAME_MAX_LENGTH, positionValidationMessages.nameMax),
  isActive: z.boolean(),
});

export type PositionFormValues = z.infer<typeof positionFormSchema> & {
  createdAt: string;
};

export const emptyPositionFormValues: PositionFormValues = {
  name: "",
  createdAt: "",
  isActive: true,
};
