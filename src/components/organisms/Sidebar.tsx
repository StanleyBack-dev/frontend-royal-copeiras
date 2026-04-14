import React from "react";
import { colors, typography } from "../../config";
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
import CrownIcon from "../atoms/icons/CrownIcon";
import { ChevronRight } from "lucide-react";
import type { ActiveView } from "../../types/views";
import {
  primaryNavigationItems,
  secondaryNavigationItems,
} from "../../router/navigation";

interface SidebarProps {
  active: ActiveView;
  onNavigate: (view: ActiveView) => void;
}

export default function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside
      className="w-64 min-h-screen flex flex-col"
      style={{ background: colors.brown[800] }}
    >
      <div
        className="px-6 py-8 border-b"
        style={{ borderColor: colors.brown[500] }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${colors.gold[500]}, ${colors.gold[600]})`,
            }}
          >
            <CrownIcon size={20} className="text-white" />
          </div>
          <div>
            <h1
              className="text-white font-bold text-sm leading-tight tracking-wide"
              style={{ fontFamily: typography.fontFamily }}
            >
              ROYAL
            </h1>
            <p
              className="text-xs tracking-widest"
              style={{
                color: colors.gold[500],
                fontFamily: typography.fontFamily,
              }}
            >
              COPEIRAS
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        <p
          className="text-xs font-semibold uppercase tracking-widest px-3 mb-4"
          style={{
            color: colors.brown[500],
            fontFamily: typography.fontFamily,
          }}
        >
          Menu Principal
        </p>
        {primaryNavigationItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                isActive ? "text-white" : "text-brown-300 hover:text-white"
              }`}
              style={
                isActive
                  ? {
                      background: "linear-gradient(135deg, #C9A227, #a8811a)",
                      color: "#fff",
                    }
                  : { color: "#c4a882" }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#3D2314";
                  (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "#c4a882";
                }
              }}
            >
              <span className={isActive ? "text-white" : ""}>{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && (
                <ChevronRight size={14} className="text-white opacity-70" />
              )}
            </button>
          );
        })}
      </nav>

      <div
        className="px-3 pb-6 space-y-1 border-t"
        style={{ borderColor: "#3D2314", paddingTop: "16px" }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest px-3 mb-3"
          style={{ color: "#7a6050" }}
        >
          Conta
        </p>
        {secondaryNavigationItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={
                isActive
                  ? {
                      background: "linear-gradient(135deg, #C9A227, #a8811a)",
                      color: "#fff",
                    }
                  : { color: "#c4a882" }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#3D2314";
                  (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "#c4a882";
                }
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
