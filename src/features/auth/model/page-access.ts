import type { ActiveView } from "../../../types/views";
import type { PageAccessKey, UserGroup } from "../../../api/users/schema";
import { getDefaultPagePermissionsByGroup } from "../../users/model/group-defaults";

const pageAccessByView: Partial<Record<ActiveView, PageAccessKey>> = {
  dashboard: "DASHBOARD",
  signatures: "CONTRACTS",
  leads: "LEADS",
  budgets: "BUDGETS",
  contracts: "CONTRACTS",
  payments: "PAYMENTS",
  clients: "CLIENTS",
  employees: "EMPLOYEES",
  positions: "POSITIONS",
  supplies: "SUPPLIES",
  users: "USERS",
  events: "EVENTS",
  publicIntake: "PUBLIC_INTAKE",
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
  if (view === "profile") {
    return true;
  }

  const requiredPermission = pageAccessByView[view];
  if (!requiredPermission) {
    return true;
  }

  return pagePermissions.includes(requiredPermission);
}
