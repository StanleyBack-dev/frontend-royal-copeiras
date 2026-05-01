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
    "EVENTS",
    "FINANCES",
    "DEBTS",
    "INVESTMENTS",
  ],
  ADMIN_MASTER: [
    "DASHBOARD",
    "LEADS",
    "BUDGETS",
    "CONTRACTS",
    "CLIENTS",
    "EMPLOYEES",
    "USERS",
    "EVENTS",
    "FINANCES",
    "DEBTS",
    "INVESTMENTS",
  ],
};

export function getDefaultPagePermissionsByGroup(
  group: UserGroup,
): PageAccessKey[] {
  return defaultByGroup[group] ?? [];
}
