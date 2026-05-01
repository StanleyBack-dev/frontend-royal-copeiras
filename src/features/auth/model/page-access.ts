import type { ActiveView } from "../../../types/views";
import type { PageAccessKey, UserGroup } from "../../../api/users/schema";
import { getDefaultPagePermissionsByGroup } from "../../users/model/group-defaults";

const pageAccessByView: Partial<Record<ActiveView, PageAccessKey>> = {
  dashboard: "DASHBOARD",
  signatures: "CONTRACTS",
  leads: "LEADS",
  budgets: "BUDGETS",
  contracts: "CONTRACTS",
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
  return getDefaultPagePermissionsByGroup(group);
}

export function hasPageAccess(
  view: ActiveView,
  pagePermissions: PageAccessKey[],
): boolean {
  // DEBUG: log page access checks (temporary)
  try {
    // eslint-disable-next-line no-console
    console.debug("hasPageAccess", { view, pagePermissions });
  } catch {}
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
