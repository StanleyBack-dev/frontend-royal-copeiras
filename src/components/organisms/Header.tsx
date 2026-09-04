import SearchIcon from "../atoms/icons/SearchIcon";
import PageHeader from "@atoms/PageHeader";
import SearchBar from "@atoms/SearchBar";
import { useState } from "react";
import { Menu } from "lucide-react";

import type { ActiveView } from "../../types/views";
import { useAuthSession } from "../../features/auth";
import {
  primaryNavigationItems,
  secondaryNavigationItems,
  viewTitles,
} from "../../router/navigation";

interface HeaderProps {
  activeView: ActiveView;
  search?: string;
  onSearchChange?: (value: string) => void;
  actions?: React.ReactNode;
  onNavigate?: (view: ActiveView) => void;
  onMenuClick?: () => void;
}

export default function Header({
  activeView,
  onNavigate,
  onMenuClick,
}: HeaderProps) {
  const { hasPageAccess } = useAuthSession();

  const info = viewTitles[activeView as keyof typeof viewTitles] || {
    title: "Painel",
    subtitle: "",
  };
  const [search, setSearch] = useState("");
  const sidebarItems = [
    ...primaryNavigationItems,
    ...secondaryNavigationItems,
  ].filter((item) => hasPageAccess(item.id));
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
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e8d5c9] bg-[#f5ede8] text-[#7a4430] lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu size={18} />
          </button>
          <div className="relative hidden w-full sm:block sm:max-w-xs">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Procurar menus..."
              icon={<SearchIcon size={14} />}
              className="bg-[#f5ede8] text-[#7a4430]"
            />
            {filtered.length > 0 && (
              <div className="absolute left-0 z-50 mt-1 w-full rounded border border-[#e8d5c9] bg-white shadow">
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
        </>
      }
    />
  );
}
