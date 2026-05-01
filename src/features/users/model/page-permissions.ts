import type { PageAccessKey } from "../../../api/users/schema";
import { getDefaultPagePermissionsByGroup } from "./group-defaults";

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

export { getDefaultPagePermissionsByGroup };
