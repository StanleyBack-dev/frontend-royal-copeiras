import type { ActiveView } from "../../types/views";
import {
  customerRoutePaths,
  employeeRoutePaths,
  positionRoutePaths,
  routePaths,
  userRoutePaths,
  leadRoutePaths,
  budgetRoutePaths,
  contractRoutePaths,
  paymentRoutePaths,
  signatureRoutePaths,
  publicIntakeRoutePaths,
} from "./paths";

export function getActiveView(pathname: string): ActiveView {
  if (
    pathname.startsWith(leadRoutePaths.list) ||
    pathname.startsWith(leadRoutePaths.legacyList)
  ) {
    return "leads";
  }

  if (
    pathname.startsWith(budgetRoutePaths.list) ||
    pathname.startsWith(budgetRoutePaths.legacyList)
  ) {
    return "budgets";
  }

  if (
    pathname.startsWith(contractRoutePaths.list) ||
    pathname.startsWith(contractRoutePaths.legacyList)
  ) {
    return "contracts";
  }

  if (pathname.startsWith(signatureRoutePaths.list)) {
    return "signatures";
  }

  if (pathname.startsWith(paymentRoutePaths.list)) {
    return "payments";
  }

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
    pathname.startsWith(positionRoutePaths.list) ||
    pathname.startsWith(positionRoutePaths.legacyList)
  ) {
    return "positions";
  }

  if (
    pathname.startsWith(userRoutePaths.list) ||
    pathname.startsWith(userRoutePaths.legacyList)
  ) {
    return "users";
  }

  if (pathname.startsWith(routePaths.events)) return "events";

  if (pathname.startsWith(publicIntakeRoutePaths.list)) return "publicIntake";

  if (pathname.startsWith(routePaths.profile)) return "profile";
  return "dashboard";
}

export function getPathForView(view: ActiveView) {
  switch (view) {
    case "dashboard":
      return routePaths.dashboard;
    case "leads":
      return leadRoutePaths.list;
    case "budgets":
      return budgetRoutePaths.list;
    case "contracts":
      return contractRoutePaths.list;
    case "signatures":
      return signatureRoutePaths.list;
    case "payments":
      return paymentRoutePaths.list;
    case "clients":
      return routePaths.clients;
    case "employees":
      return employeeRoutePaths.list;
    case "positions":
      return positionRoutePaths.list;
    case "users":
      return userRoutePaths.list;
    case "events":
      return routePaths.events;
    case "publicIntake":
      return publicIntakeRoutePaths.list;
    case "profile":
      return routePaths.profile;
    default:
      return routePaths.dashboard;
  }
}
