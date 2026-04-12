import { useState } from "react";
import Sidebar from "./components/organisms/Sidebar";
import Header from "./components/organisms/Header";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Events from "./pages/Events";
import Finance from "./pages/Finance";
import Debts from "./pages/Debts";
import Investments from "./pages/Investments";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import { ActiveView } from "./types/views";

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");

  const views: Record<ActiveView, React.ReactNode> = {
    dashboard: <Dashboard />,
    clients: <Customers />,
    events: <Events />,
    finances: <Finance />,
    debts: <Debts />,
    investments: <Investments />,
    profile: <Profile />,
    settings: <Settings />,
  };

  return (
    <div className="flex min-h-screen" style={{ background: "#faf6f2" }}>
      <Sidebar active={activeView} onNavigate={setActiveView} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header activeView={activeView} />
        <main className="flex-1 p-8 overflow-auto">{views[activeView]}</main>
      </div>
    </div>
  );
}
