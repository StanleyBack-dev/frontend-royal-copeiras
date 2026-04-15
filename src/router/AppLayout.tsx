import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/organisms/Sidebar";
import Header from "../components/organisms/Header";
import type { ActiveView } from "../types/views";
import { getActiveView, getPathForView } from "./navigation";

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const activeView = useMemo(
    () => getActiveView(location.pathname),
    [location.pathname],
  );

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  function handleNavigate(view: ActiveView) {
    const path = getPathForView(view);

    if (path) {
      navigate(path);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#faf6f2] text-[#2c1810]">
      <Sidebar
        active={activeView}
        onNavigate={handleNavigate}
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          activeView={activeView}
          onNavigate={handleNavigate}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
