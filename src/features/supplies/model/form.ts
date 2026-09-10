import { z } from "zod";
import {
  SUPPLY_NAME_MAX_LENGTH,
  SUPPLY_NAME_MIN_LENGTH,
  SUPPLY_UNIT_MAX_LENGTH,
} from "./constants";
import { supplyValidationMessages } from "./messages";

export const supplyFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(SUPPLY_NAME_MIN_LENGTH, supplyValidationMessages.nameMin)
    .max(SUPPLY_NAME_MAX_LENGTH, supplyValidationMessages.nameMax),
  defaultUnit: z.string().trim().max(SUPPLY_UNIT_MAX_LENGTH),
  suggestedUnitPrice: z.string(),
  isActive: z.boolean(),
});

export type SupplyFormValues = z.infer<typeof supplyFormSchema> & {
  createdAt: string;
};

export const emptySupplyFormValues: SupplyFormValues = {
  name: "",
  defaultUnit: "",
  suggestedUnitPrice: "",
  createdAt: "",
  isActive: true,
};
