import type { ReactNode } from "react";
import type { ActiveView } from "../types/views";
import DashboardIcon from "../components/atoms/icons/DashboardIcon";
import ClientsIcon from "../components/atoms/icons/ClientsIcon";
import EmployeesIcon from "../components/atoms/icons/EmployeesIcon";
import UsersIcon from "../components/atoms/icons/UsersIcon";
import EventsIcon from "../components/atoms/icons/EventsIcon";
import FinancesIcon from "../components/atoms/icons/FinancesIcon";
import DebtsIcon from "../components/atoms/icons/DebtsIcon";
import InvestmentsIcon from "../components/atoms/icons/InvestmentsIcon";
import ProfileIcon from "../components/atoms/icons/ProfileIcon";
import SettingsIcon from "../components/atoms/icons/SettingsIcon";

export interface NavigationItem {
  id: ActiveView;
  label: string;
  icon: ReactNode;
}

export const routePaths: Record<ActiveView, string> = {
  dashboard: "/dashboard",
  clients: "/clientes",
  employees: "/funcionarios",
  users: "/usuarios",
  events: "/eventos",
  finances: "/financas",
  debts: "/dividas",
  investments: "/investimentos",
  profile: "/perfil",
  settings: "/configuracoes",
};

export const customerRoutePaths = {
  list: "/clientes",
  create: "/clientes/new",
  edit: (id = ":id") => `/clientes/${id}/edit`,
  legacyList: "/customers",
  legacyCreate: "/customers/new",
  legacyEdit: (id = ":id") => `/customers/${id}/edit`,
};

export const employeeRoutePaths = {
  list: "/funcionarios",
  create: "/funcionarios/new",
  edit: (id = ":id") => `/funcionarios/${id}/edit`,
  legacyList: "/employees",
  legacyCreate: "/employees/new",
  legacyEdit: (id = ":id") => `/employees/${id}/edit`,
};

export const userRoutePaths = {
  list: "/usuarios",
  create: "/usuarios/new",
  edit: (id = ":id") => `/usuarios/${id}/edit`,
  legacyList: "/users",
  legacyCreate: "/users/new",
  legacyEdit: (id = ":id") => `/users/${id}/edit`,
};

export const viewTitles: Record<
  ActiveView,
  { title: string; subtitle: string }
> = {
  dashboard: { title: "Painel Geral", subtitle: "Visão geral da empresa" },
  clients: { title: "Clientes", subtitle: "Gerenciar clientes" },
  employees: {
    title: "Funcionários",
    subtitle: "Gerenciar colaboradores",
  },
  users: {
    title: "Usuários",
    subtitle: "Gerenciar usuários de acesso",
  },
  events: { title: "Eventos", subtitle: "Agenda e histórico de eventos" },
  finances: { title: "Finanças", subtitle: "Controle financeiro" },
  debts: { title: "Dívidas", subtitle: "Contas a pagar e receber" },
  investments: { title: "Investimentos", subtitle: "Gestão de investimentos" },
  profile: { title: "Perfil", subtitle: "Informações da empresa" },
  settings: { title: "Configurações", subtitle: "Preferências do sistema" },
};

export const primaryNavigationItems: NavigationItem[] = [
  { id: "dashboard", label: "Painel", icon: <DashboardIcon size={20} /> },
  { id: "clients", label: "Clientes", icon: <ClientsIcon size={20} /> },
  { id: "employees", label: "Funcionários", icon: <EmployeesIcon size={20} /> },
  { id: "users", label: "Usuários", icon: <UsersIcon size={20} /> },
  { id: "events", label: "Eventos", icon: <EventsIcon size={20} /> },
  { id: "finances", label: "Finanças", icon: <FinancesIcon size={20} /> },
  { id: "debts", label: "Dívidas", icon: <DebtsIcon size={20} /> },
  {
    id: "investments",
    label: "Investimentos",
    icon: <InvestmentsIcon size={20} />,
  },
];

export const secondaryNavigationItems: NavigationItem[] = [
  { id: "profile", label: "Perfil", icon: <ProfileIcon size={20} /> },
  { id: "settings", label: "Configurações", icon: <SettingsIcon size={20} /> },
];

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
