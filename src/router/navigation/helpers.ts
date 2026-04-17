import type { ActiveView } from "../../types/views";
import {
  customerRoutePaths,
  employeeRoutePaths,
  routePaths,
  userRoutePaths,
} from "./paths";

export function getActiveView(pathname: string): ActiveView {
  if (
    pathname.startsWith(customerRoutePaths.list) ||
    pathname.startsWith(customerRoutePaths.legacyList)
  ) {
    return "clients";
  }

  if (
    pathname.startsWith(employeeRoutePaths.list) ||
    pathname.startsWith(employeeRoutePaths.legacyList)
  ) {
    return "employees";
  }

  if (
    pathname.startsWith(userRoutePaths.list) ||
    pathname.startsWith(userRoutePaths.legacyList)
  ) {
    return "users";
  }

  if (pathname.startsWith(routePaths.events)) return "events";
  if (pathname.startsWith(routePaths.finances)) return "finances";
  if (pathname.startsWith(routePaths.debts)) return "debts";
  if (pathname.startsWith(routePaths.investments)) return "investments";
  if (pathname.startsWith(routePaths.profile)) return "profile";
  if (pathname.startsWith(routePaths.settings)) return "settings";
  return "dashboard";
}

export function getPathForView(view: ActiveView) {
  switch (view) {
    case "dashboard":
      return routePaths.dashboard;
    case "clients":
      return routePaths.clients;
    case "employees":
      return employeeRoutePaths.list;
    case "users":
      return userRoutePaths.list;
    case "events":
      return routePaths.events;
    case "finances":
      return routePaths.finances;
    case "debts":
      return routePaths.debts;
    case "investments":
      return routePaths.investments;
    case "profile":
      return routePaths.profile;
    case "settings":
      return routePaths.settings;
    default:
      return routePaths.dashboard;
  }
}
