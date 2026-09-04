import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { colors, typography } from "../../config";
import CrownIcon from "../atoms/icons/CrownIcon";
import ConfirmDialog from "../molecules/ConfirmDialog";
import { ChevronDown, ChevronRight, LogOut } from "lucide-react";
import type { ActiveView } from "../../types/views";
import { logoutCurrentSession, useAuthSession } from "../../features/auth";
import { authRoutePaths } from "../../router";
import { useToast } from "../../shared/toast/useToast";
import { AuthApiError } from "../../api/auth/methods/http-error";
import {
  primaryNavigationItems,
  secondaryNavigationItems,
  type NavigationItem,
} from "../../router/navigation";

interface SidebarProps {
  active: ActiveView;
  onNavigate: (view: ActiveView) => void;
  mobileOpen?: boolean;
  onClose?: () => void;
}

interface NavButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
  loading?: boolean;
  onClick: () => void;
}

function NavButton({
  label,
  icon,
  isActive,
  loading,
  onClick,
}: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 disabled:opacity-60"
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
          (e.currentTarget as HTMLButtonElement).style.background = "#3D2314";
          (e.currentTarget as HTMLButtonElement).style.color = "#fff";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.background =
            "transparent";
          (e.currentTarget as HTMLButtonElement).style.color = "#c4a882";
        }
      }}
    >
      <span className={isActive ? "text-white" : ""}>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {isActive && <ChevronRight size={14} className="text-white opacity-70" />}
    </button>
  );
}

export default function Sidebar({
  active,
  onNavigate,
  mobileOpen = false,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate();
  const { clearSession, hasPageAccess } = useAuthSession();
  const { showSuccess, showError } = useToast();
  const [accountOpen, setAccountOpen] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem("royal:sidebarAccountOpen") === "1";
    } catch {
      return false;
    }
  });
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "royal:sidebarAccountOpen",
        accountOpen ? "1" : "0",
      );
    } catch {
      /* storage unavailable — the section just won't be remembered */
    }
  }, [accountOpen]);

  const visiblePrimaryItems = primaryNavigationItems.filter((item) =>
    hasPageAccess(item.id),
  );
  const visibleAccountItems = secondaryNavigationItems.filter((item) =>
    hasPageAccess(item.id),
  );

  function handleSelect(item: NavigationItem) {
    onNavigate(item.id);
    onClose?.();
  }

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logoutCurrentSession();
      showSuccess("Sessao encerrada", "Logout realizado com sucesso.");
    } catch (error) {
      const message =
        error instanceof AuthApiError || error instanceof Error
          ? error.message
          : "Nao foi possivel encerrar a sessao no servidor.";

      showError("Logout parcial", message);
    } finally {
      clearSession();
      setIsLoggingOut(false);
      navigate(authRoutePaths.login, { replace: true });
    }
  }

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
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-72 max-w-[85vw] flex-col transition-transform duration-300 lg:sticky lg:top-0 lg:z-0 lg:h-dvh lg:w-64 lg:max-w-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ background: colors.brown[800] }}
      >
        <div
          className="flex shrink-0 items-center justify-between border-b px-5 py-6 lg:px-6 lg:py-8"
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

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5 lg:py-6">
          <p
            className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest"
            style={{
              color: colors.brown[500],
              fontFamily: typography.fontFamily,
            }}
          >
            Menu Principal
          </p>
          {visiblePrimaryItems.map((item) => (
            <NavButton
              key={item.id}
              label={item.label}
              icon={item.icon}
              isActive={active === item.id}
              onClick={() => handleSelect(item)}
            />
          ))}
        </nav>

        <div
          className="shrink-0 space-y-1 border-t px-3 pb-6 pt-4"
          style={{ borderColor: "#3D2314" }}
        >
          {visibleAccountItems.length > 0 ? (
            <>
              <button
                type="button"
                onClick={() => setAccountOpen((current) => !current)}
                aria-expanded={accountOpen}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#7a6050" }}
              >
                <span>Conta</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    accountOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {accountOpen ? (
                <div
                  className="space-y-1 border-l pl-3"
                  style={{ borderColor: "#3D2314" }}
                >
                  {visibleAccountItems.map((item) => (
                    <NavButton
                      key={item.id}
                      label={item.label}
                      icon={item.icon}
                      isActive={active === item.id}
                      onClick={() => handleSelect(item)}
                    />
                  ))}
                </div>
              ) : null}
            </>
          ) : null}

          <NavButton
            label="Sair"
            icon={<LogOut size={20} />}
            loading={isLoggingOut}
            onClick={() => setConfirmLogoutOpen(true)}
          />
        </div>
      </aside>

      <ConfirmDialog
        open={confirmLogoutOpen}
        title="Sair da conta"
        variant="warning"
        description={
          <p>
            Você será desconectado e precisará entrar novamente para acessar o
            sistema.
            <br />
            <br />
            Deseja realmente sair?
          </p>
        }
        confirmLabel="Sim, sair"
        cancelLabel="Cancelar"
        onConfirm={() => {
          setConfirmLogoutOpen(false);
          void handleLogout();
        }}
        onCancel={() => setConfirmLogoutOpen(false)}
      />
    </>
  );
}
