import type {
  CreatePositionPayload,
  Position,
} from "../../../api/positions/schema";
import { formatDateTimeDisplay } from "../../../utils/format";
import type { PositionFormValues } from "./form";

export function mapPositionToFormValues(
  position: Position,
): PositionFormValues {
  return {
    name: position.name,
    createdAt: formatDateTimeDisplay(position.createdAt),
    isActive: position.isActive,
  };
}

export function mapPositionFormToValidationInput(values: PositionFormValues) {
  return {
    name: values.name,
    isActive: values.isActive,
  };
}

export function mapPositionFormToPayload(
  values: PositionFormValues,
): CreatePositionPayload {
  return {
    name: values.name,
    isActive: values.isActive,
  };
}
