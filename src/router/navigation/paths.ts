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

export const leadRoutePaths = {
  list: "/eventos/leads",
  create: "/eventos/leads/new",
  edit: (id = ":id") => `/eventos/leads/${id}/edit`,
  legacyList: "/leads",
  legacyCreate: "/leads/new",
  legacyEdit: (id = ":id") => `/leads/${id}/edit`,
};

export const budgetRoutePaths = {
  list: "/eventos/orcamentos",
  create: "/eventos/orcamentos/new",
  edit: (id = ":id") => `/eventos/orcamentos/${id}/edit`,
  legacyList: "/budgets",
  legacyCreate: "/budgets/new",
  legacyEdit: (id = ":id") => `/budgets/${id}/edit`,
};

export const contractRoutePaths = {
  list: "/eventos/contratos",
  create: "/eventos/contratos/new",
  edit: (id = ":id") => `/eventos/contratos/${id}/edit`,
  legacyList: "/contracts",
  legacyCreate: "/contracts/new",
  legacyEdit: (id = ":id") => `/contracts/${id}/edit`,
};

export const authRoutePaths = {
  login: "/",
  firstAccessChangePassword: "/primeiro-acesso/alterar-senha",
  passwordRecovery: "/recuperar-senha",
  passwordRecoveryReset: "/recuperar-senha/nova-senha",
};

export const utilityRoutePaths = {
  accessDenied: "/acesso-negado",
};
