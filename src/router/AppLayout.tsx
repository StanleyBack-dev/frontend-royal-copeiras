import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import Sidebar from "../components/organisms/Sidebar";
import Header from "../components/organisms/Header";
import type { ActiveView } from "../types/views";
import { getActiveView, getPathForView } from "./navigation";

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeView = useMemo(
    () => getActiveView(location.pathname),
    [location.pathname],
  );

  function handleNavigate(view: ActiveView) {
    const path = getPathForView(view);

    if (path) {
      navigate(path);
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#faf6f2" }}>
      <Sidebar active={activeView} onNavigate={handleNavigate} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header activeView={activeView} onNavigate={handleNavigate} />
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
