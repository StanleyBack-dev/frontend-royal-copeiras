import type { ReactNode } from "react";
import type { ActiveView } from "../../types/views";
import DashboardIcon from "../../components/atoms/icons/DashboardIcon";
import ClientsIcon from "../../components/atoms/icons/ClientsIcon";
import EmployeesIcon from "../../components/atoms/icons/EmployeesIcon";
import EventsIcon from "../../components/atoms/icons/EventsIcon";
import FinancesIcon from "../../components/atoms/icons/FinancesIcon";
import DebtsIcon from "../../components/atoms/icons/DebtsIcon";
import InvestmentsIcon from "../../components/atoms/icons/InvestmentsIcon";
import SettingsIcon from "../../components/atoms/icons/SettingsIcon";
import {
  FileSignature,
  CreditCard,
  Target,
  Calculator,
  Layers,
  User,
  Shield,
} from "lucide-react";

export interface NavigationItem {
  id: ActiveView;
  label: string;
  icon: ReactNode;
}

export const primaryNavigationItems: NavigationItem[] = [
  { id: "dashboard", label: "Painel", icon: <DashboardIcon size={20} /> },
  { id: "leads", label: "Leads", icon: <Target size={20} /> },
  { id: "budgets", label: "Orçamentos", icon: <Calculator size={20} /> },
  { id: "contracts", label: "Contratos", icon: <FileSignature size={20} /> },
  {
    id: "signatures",
    label: "Assinaturas",
    icon: <FileSignature size={20} />,
  },
  { id: "events", label: "Eventos", icon: <EventsIcon size={20} /> },
  { id: "clients", label: "Clientes", icon: <ClientsIcon size={20} /> },
  { id: "employees", label: "Funcionários", icon: <EmployeesIcon size={20} /> },
  { id: "positions", label: "Cargos", icon: <Layers size={20} /> },
  { id: "users", label: "Usuários", icon: <Shield size={20} /> },
  { id: "payments", label: "Pagamentos", icon: <CreditCard size={20} /> },
  { id: "finances", label: "Finanças", icon: <FinancesIcon size={20} /> },
  { id: "debts", label: "Dívidas", icon: <DebtsIcon size={20} /> },
  {
    id: "investments",
    label: "Investimentos",
    icon: <InvestmentsIcon size={20} />,
  },
];

export const secondaryNavigationItems: NavigationItem[] = [
  { id: "profile", label: "Perfil", icon: <User size={20} /> },
  { id: "settings", label: "Configurações", icon: <SettingsIcon size={20} /> },
];
