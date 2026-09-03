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
    "EVENTS",
    "PAYMENTS",
  ],
  ADMIN_MASTER: [
    "DASHBOARD",
    "LEADS",
    "BUDGETS",
    "CONTRACTS",
    "CLIENTS",
    "EMPLOYEES",
    "POSITIONS",
    "USERS",
    "EVENTS",
    "PAYMENTS",
  ],
};

export function getDefaultPagePermissionsByGroup(
  group: UserGroup,
): PageAccessKey[] {
  return defaultByGroup[group] ?? [];
}
