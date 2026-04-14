import SearchIcon from "../atoms/icons/SearchIcon";
import BellIcon from "../atoms/icons/BellIcon";
import PageHeader from "@atoms/PageHeader";
import SearchBar from "@atoms/SearchBar";
import Button from "@atoms/Button";
import { useState } from "react";

import type { ActiveView } from "../../types/views";
import {
  primaryNavigationItems,
  secondaryNavigationItems,
  viewTitles,
} from "../../router/navigation";

interface HeaderProps {
  activeView: ActiveView;
  search?: string;
  onSearchChange?: (value: string) => void;
  onBellClick?: () => void;
  actions?: React.ReactNode;
  onNavigate?: (view: ActiveView) => void;
}

export default function Header({ activeView, onNavigate }: HeaderProps) {
  const info = viewTitles[activeView as keyof typeof viewTitles] || {
    title: "Painel",
    subtitle: "",
  };
  const [search, setSearch] = useState("");
  const sidebarItems = [...primaryNavigationItems, ...secondaryNavigationItems];
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
