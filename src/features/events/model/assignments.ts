import type { EventAssignment } from "@/api/events/schema";
import {
  getBudgetServiceDisplayLabel,
  inferBudgetServiceType,
  inferServiceGenderFromDescription,
  type BudgetServiceType,
} from "@/features/budgets/model/service-items";
import { eventUiCopy } from "./messages";

export type EventEmployeeGender = "MALE" | "FEMALE";

/** Slot title ("Copeira 2") and the employee gender its service requires. */
export function resolveAssignmentSlot(assignment: EventAssignment): {
  label: string;
  requiredGender?: EventEmployeeGender;
} {
  const description = assignment.budgetItemDescription ?? "";
  const serviceType = description ? inferBudgetServiceType(description) : "";

  if (!serviceType) {
    return {
      label: `${eventUiCopy.detail.assignment.service} ${assignment.allocationIndex}`,
    };
  }

  const gender = inferServiceGenderFromDescription(
    description,
    serviceType as BudgetServiceType,
  );

  return {
    label: `${getBudgetServiceDisplayLabel(serviceType as BudgetServiceType, 1, gender)} ${assignment.allocationIndex}`,
    requiredGender:
      gender === "Feminino"
        ? "FEMALE"
        : gender === "Masculino"
          ? "MALE"
          : undefined,
  };
}
