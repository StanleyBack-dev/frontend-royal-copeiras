import type { PageAccessKey, UserGroup } from "../../../api/users/schema";

export const defaultByGroup: Record<UserGroup, PageAccessKey[]> = {
  USER: ["DASHBOARD"],
  ADMIN: [
    "DASHBOARD",
    "LEADS",
    "BUDGETS",
    "CONTRACTS",
    "CLIENTS",
    "EMPLOYEES",
    "POSITIONS",
    "SUPPLIES",
    "EVENTS",
    "PAYMENTS",
    "PUBLIC_INTAKE",
  ],
  ADMIN_MASTER: [
    "DASHBOARD",
    "LEADS",
    "BUDGETS",
    "CONTRACTS",
    "CLIENTS",
    "EMPLOYEES",
    "POSITIONS",
    "SUPPLIES",
    "USERS",
    "EVENTS",
    "PAYMENTS",
    "PUBLIC_INTAKE",
  ],
};

export function getDefaultPagePermissionsByGroup(
  group: UserGroup,
): PageAccessKey[] {
  return defaultByGroup[group] ?? [];
}
