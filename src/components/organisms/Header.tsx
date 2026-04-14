import SearchIcon from "../atoms/icons/SearchIcon";
import BellIcon from "../atoms/icons/BellIcon";
import PageHeader from "@atoms/PageHeader";
import SearchBar from "@atoms/SearchBar";
import Button from "@atoms/Button";
import DashboardIcon from "../atoms/icons/DashboardIcon";
import ClientsIcon from "../atoms/icons/ClientsIcon";
import EmployeesIcon from "../atoms/icons/EmployeesIcon";
import UsersIcon from "../atoms/icons/UsersIcon";
import EventsIcon from "../atoms/icons/EventsIcon";
import FinancesIcon from "../atoms/icons/FinancesIcon";
import DebtsIcon from "../atoms/icons/DebtsIcon";
import InvestmentsIcon from "../atoms/icons/InvestmentsIcon";
import ProfileIcon from "../atoms/icons/ProfileIcon";
import SettingsIcon from "../atoms/icons/SettingsIcon";
import { useState } from "react";

const viewTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: "Painel Geral", subtitle: "Visão geral da empresa" },
  clients: { title: "Clientes", subtitle: "Gerenciar clientes" },
  events: { title: "Eventos", subtitle: "Agenda e histórico de eventos" },
  finances: { title: "Finanças", subtitle: "Controle financeiro" },
  debts: { title: "Dívidas", subtitle: "Contas a pagar e receber" },
  investments: { title: "Investimentos", subtitle: "Gestão de investimentos" },
  profile: { title: "Perfil", subtitle: "Informações da empresa" },
  settings: { title: "Configurações", subtitle: "Preferências do sistema" },
};

import type { ActiveView } from "../../types/views";

interface HeaderProps {
  activeView: ActiveView;
  search?: string;
  onSearchChange?: (value: string) => void;
  onBellClick?: () => void;
  actions?: React.ReactNode;
  onNavigate?: (view: ActiveView) => void;
}

export default function Header({ activeView, onNavigate }: HeaderProps) {
  const info = viewTitles[activeView] || { title: "Painel", subtitle: "" };
  const [search, setSearch] = useState("");
  const sidebarItems = [
    { id: "dashboard", label: "Painel", icon: <DashboardIcon size={16} /> },
    { id: "clients", label: "Clientes", icon: <ClientsIcon size={16} /> },
    {
      id: "employees",
      label: "Funcionários",
      icon: <EmployeesIcon size={16} />,
    },
    { id: "users", label: "Usuários", icon: <UsersIcon size={16} /> },
    { id: "events", label: "Eventos", icon: <EventsIcon size={16} /> },
    { id: "finances", label: "Finanças", icon: <FinancesIcon size={16} /> },
    { id: "debts", label: "Dívidas", icon: <DebtsIcon size={16} /> },
    {
      id: "investments",
      label: "Investimentos",
      icon: <InvestmentsIcon size={16} />,
    },
    { id: "profile", label: "Perfil", icon: <ProfileIcon size={16} /> },
    {
      id: "settings",
      label: "Configurações",
      icon: <SettingsIcon size={16} />,
    },
  ];
  const filtered =
    search.length > 0
      ? sidebarItems.filter((item) =>
          item.label.toLowerCase().includes(search.toLowerCase()),
        )
      : [];

  return (
    <PageHeader
      title={info.title}
      subtitle={info.subtitle}
      actions={
        <>
          <div className="relative">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Procurar menus..."
              icon={<SearchIcon size={14} />}
              className="bg-[#f5ede8] text-[#7a4430]"
            />
            {filtered.length > 0 && (
              <div className="absolute left-0 mt-1 w-full bg-white rounded shadow z-50 border border-[#e8d5c9]">
                {filtered.map((item) => (
                  <button
                    key={item.id}
                    className="w-full text-left px-4 py-2 hover:bg-[#f5ede8] text-[#7a4430] text-sm"
                    onClick={() => {
                      setSearch("");
                      if (onNavigate) onNavigate(item.id as ActiveView);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      {item.label}
                      {item.icon}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            style={{
              position: "relative",
              background: "#f5ede8",
              color: "#7a4430",
            }}
            onClick={() => {}}
          >
            <BellIcon size={16} />
            <span
              className="absolute top-1 right-1 w-2 h-2 rounded-full"
              style={{ background: "#C9A227" }}
            />
          </Button>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{
                background: "linear-gradient(135deg, #C9A227, #a8811a)",
              }}
            >
              RC
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold" style={{ color: "#2C1810" }}>
                Royal Copeiras
              </p>
              <p className="text-xs" style={{ color: "#9a7060" }}>
                Administrador
              </p>
            </div>
          </div>
        </>
      }
    />
  );
}
