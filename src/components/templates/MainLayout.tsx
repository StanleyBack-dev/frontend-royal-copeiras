// Template: MainLayout
import Sidebar from "../organisms/Sidebar";
import Header from "../organisms/Header";
import type { ActiveView } from "../../types/views";

interface MainLayoutProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  children: React.ReactNode;
}

export default function MainLayout({
  activeView,
  onNavigate,
  children,
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar active={activeView} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col">
        <Header activeView={activeView} />
        <main className="flex-1 bg-gray-50 p-8">{children}</main>
      </div>
    </div>
  );
}
