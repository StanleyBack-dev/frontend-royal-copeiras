import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/organisms/Sidebar";
import Header from "./components/organisms/Header";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/customers/Customers.tsx";
import CustomerForm from "./pages/customers/CustomerForm.tsx";
import Events from "./pages/Events";
import Finance from "./pages/Finance";
import Debts from "./pages/Debts";
import Investments from "./pages/Investments";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

import { useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import type { ActiveView } from "./types/views";

//

function getActiveView(pathname: string): ActiveView {
  if (pathname.startsWith("/clientes")) return "clients";
  if (pathname.startsWith("/eventos")) return "events";
  if (pathname.startsWith("/financas")) return "finances";
  if (pathname.startsWith("/dividas")) return "debts";
  if (pathname.startsWith("/investimentos")) return "investments";
  if (pathname.startsWith("/perfil")) return "profile";
  if (pathname.startsWith("/configuracoes")) return "settings";
  return "dashboard";
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <RouterContent />
    </BrowserRouter>
  );
}

function RouterContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeView = useMemo(
    () => getActiveView(location.pathname),
    [location.pathname],
  );
  const handleNavigate = (view: ActiveView) => {
    switch (view) {
      case "dashboard":
        navigate("/dashboard");
        break;
      case "clients":
        navigate("/clientes");
        break;
      case "employees":
        // Exemplo: navegação futura
        break;
      case "users":
        // Exemplo: navegação futura
        break;
      case "events":
        navigate("/eventos");
        break;
      case "finances":
        navigate("/financas");
        break;
      case "debts":
        navigate("/dividas");
        break;
      case "investments":
        navigate("/investimentos");
        break;
      case "profile":
        navigate("/perfil");
        break;
      case "settings":
        navigate("/configuracoes");
        break;
      default:
        navigate("/dashboard");
    }
  };
  return (
    <div className="flex min-h-screen" style={{ background: "#faf6f2" }}>
      <Sidebar active={activeView} onNavigate={handleNavigate} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header activeView={activeView} onNavigate={handleNavigate} />
        <main className="flex-1 p-8 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/clientes" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clientes" element={<Customers />} />
            <Route
              path="/clientes/new"
              element={<CustomerForm mode="create" />}
            />
            <Route
              path="/clientes/:id/edit"
              element={<CustomerForm mode="edit" />}
            />
            <Route
              path="/customers"
              element={<Navigate to="/clientes" replace />}
            />
            <Route
              path="/customers/new"
              element={<Navigate to="/clientes/new" replace />}
            />
            <Route
              path="/customers/:id/edit"
              element={<Navigate to="/clientes/:id/edit" replace />}
            />
            <Route path="/eventos" element={<Events />} />
            <Route path="/financas" element={<Finance />} />
            <Route path="/dividas" element={<Debts />} />
            <Route path="/investimentos" element={<Investments />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/configuracoes" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
