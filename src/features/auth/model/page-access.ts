import type { ActiveView } from "../../../types/views";
import type { PageAccessKey, UserGroup } from "../../../api/users/schema";

const groupDefaults: Record<UserGroup, PageAccessKey[]> = {
  USER: ["DASHBOARD", "EVENTS", "FINANCES", "DEBTS", "INVESTMENTS"],
  ADMIN: [
    "DASHBOARD",
    "CLIENTS",
    "EMPLOYEES",
    "USERS",
    "EVENTS",
    "FINANCES",
    "DEBTS",
    "INVESTMENTS",
  ],
  ADMIN_MASTER: [
    "DASHBOARD",
    "CLIENTS",
    "EMPLOYEES",
    "USERS",
    "EVENTS",
    "FINANCES",
    "DEBTS",
    "INVESTMENTS",
  ],
};

const pageAccessByView: Partial<Record<ActiveView, PageAccessKey>> = {
  dashboard: "DASHBOARD",
  clients: "CLIENTS",
  employees: "EMPLOYEES",
  users: "USERS",
  events: "EVENTS",
  finances: "FINANCES",
  debts: "DEBTS",
  investments: "INVESTMENTS",
};

export function getGroupDefaultPagePermissions(
  group: UserGroup,
): PageAccessKey[] {
  return groupDefaults[group] ?? [];
}

export function hasPageAccess(
  view: ActiveView,
  pagePermissions: PageAccessKey[],
): boolean {
  if (view === "profile" || view === "settings") {
    return true;
  }

  const requiredPermission = pageAccessByView[view];
  if (!requiredPermission) {
    return true;
  }

  return pagePermissions.includes(requiredPermission);
}

export function isRoutedView(view: ActiveView): boolean {
  return view !== "profile" && view !== "settings";
}
