import { colors, typography } from "../../config";
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
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  active,
  onNavigate,
  mobileOpen = false,
  onClose,
}: SidebarProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-[#2c1810]/50 transition-opacity duration-300 lg:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!mobileOpen}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex min-h-screen w-72 max-w-[85vw] flex-col transition-transform duration-300 lg:sticky lg:top-0 lg:z-0 lg:w-64 lg:max-w-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ background: colors.brown[800] }}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-6 lg:px-6 lg:py-8"
          style={{ borderColor: colors.brown[500] }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                background: `linear-gradient(135deg, ${colors.gold[500]}, ${colors.gold[600]})`,
              }}
            >
              <CrownIcon size={20} className="text-white" />
            </div>
            <div>
              <h1
                className="text-sm font-bold leading-tight tracking-wide text-white"
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
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-xs font-semibold text-[#c4a882] lg:hidden"
          >
            Fechar
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5 lg:py-6">
          <p
            className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest"
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
                onClick={() => {
                  onNavigate(item.id);
                  onClose?.();
                }}
                className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ${
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
                <span className={isActive ? "text-white" : ""}>
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && (
                  <ChevronRight size={14} className="text-white opacity-70" />
                )}
              </button>
            );
          })}
        </nav>

        <div
          className="space-y-1 border-t px-3 pb-6 pt-4"
          style={{ borderColor: "#3D2314" }}
        >
          <p
            className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#7a6050" }}
          >
            Conta
          </p>
          {secondaryNavigationItems.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose?.();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200"
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
    </>
  );
}
