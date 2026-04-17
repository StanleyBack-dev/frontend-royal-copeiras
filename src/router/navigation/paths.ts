import type { ActiveView } from "../../types/views";

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

export const authRoutePaths = {
  login: "/",
  firstAccessChangePassword: "/primeiro-acesso/alterar-senha",
};
