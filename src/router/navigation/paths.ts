import type { ActiveView } from "../../types/views";

export const routePaths: Record<ActiveView, string> = {
  dashboard: "/dashboard",
  leads: "/leads",
  budgets: "/orcamentos",
  contracts: "/contratos",
  signatures: "/assinaturas",
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
  list: "/leads",
  create: "/leads/new",
  edit: (id = ":id") => `/leads/${id}/edit`,
  legacyList: "/eventos/leads",
  legacyCreate: "/eventos/leads/new",
  legacyEdit: (id = ":id") => `/eventos/leads/${id}/edit`,
};

export const budgetRoutePaths = {
  list: "/orcamentos",
  create: "/orcamentos/new",
  edit: (id = ":id") => `/orcamentos/${id}/edit`,
  legacyList: "/eventos/orcamentos",
  legacyCreate: "/eventos/orcamentos/new",
  legacyEdit: (id = ":id") => `/eventos/orcamentos/${id}/edit`,
};

export const contractRoutePaths = {
  list: "/contratos",
  create: "/contratos/new",
  edit: (id = ":id") => `/contratos/${id}/edit`,
  legacyList: "/eventos/contratos",
  legacyCreate: "/eventos/contratos/new",
  legacyEdit: (id = ":id") => `/eventos/contratos/${id}/edit`,
};

export const signatureRoutePaths = {
  list: "/assinaturas",
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
