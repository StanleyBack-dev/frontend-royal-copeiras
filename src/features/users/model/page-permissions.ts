import type { PageAccessKey, UserGroup } from "../../../api/users/schema";

export interface PagePermissionOption {
  key: PageAccessKey;
  label: string;
}

export const pagePermissionOptions: PagePermissionOption[] = [
  { key: "DASHBOARD", label: "Painel" },
  { key: "LEADS", label: "Leads" },
  { key: "BUDGETS", label: "Orçamentos" },
  { key: "CONTRACTS", label: "Contratos" },
  { key: "CLIENTS", label: "Clientes" },
  { key: "EMPLOYEES", label: "Funcionários" },
  { key: "USERS", label: "Usuários" },
  { key: "EVENTS", label: "Eventos" },
  { key: "FINANCES", label: "Finanças" },
  { key: "DEBTS", label: "Dívidas" },
  { key: "INVESTMENTS", label: "Investimentos" },
];

const defaultByGroup: Record<UserGroup, PageAccessKey[]> = {
  USER: [
    "DASHBOARD",
    "LEADS",
    "BUDGETS",
    "CONTRACTS",
    "EVENTS",
    "FINANCES",
    "DEBTS",
    "INVESTMENTS",
  ],
  ADMIN: [
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
