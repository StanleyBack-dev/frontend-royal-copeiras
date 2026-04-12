// Organism: Sidebar
import React from 'react';
import { LayoutDashboard, Users, CalendarDays, TrendingUp, AlertCircle, PiggyBank, CircleUser as UserCircle, Settings, ChevronRight, Crown } from 'lucide-react';
import type { ActiveView } from '../../types/views';

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Painel', icon: <LayoutDashboard size={20} /> },
  { id: 'clients', label: 'Clientes', icon: <Users size={20} /> },
  { id: 'employees', label: 'Funcionários', icon: <UserCircle size={20} /> },
  { id: 'users', label: 'Usuários', icon: <Settings size={20} /> },
  { id: 'events', label: 'Eventos', icon: <CalendarDays size={20} /> },
  { id: 'finances', label: 'Finanças', icon: <TrendingUp size={20} /> },
  { id: 'debts', label: 'Dívidas', icon: <AlertCircle size={20} /> },
  { id: 'investments', label: 'Investimentos', icon: <PiggyBank size={20} /> },
];

const bottomItems: NavItem[] = [
  { id: 'profile', label: 'Perfil', icon: <UserCircle size={20} /> },
  { id: 'settings', label: 'Configurações', icon: <Settings size={20} /> },
];

interface SidebarProps {
  active: ActiveView;
  onNavigate: (view: ActiveView) => void;
}

export default function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ background: '#2C1810' }}>
      <div className="px-6 py-8 border-b" style={{ borderColor: '#3D2314' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #C9A227, #a8811a)' }}
          >
            <Crown size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight tracking-wide">ROYAL</h1>
            <p className="text-xs tracking-widest" style={{ color: '#C9A227' }}>
              COPEIRAS
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        <p
          className="text-xs font-semibold uppercase tracking-widest px-3 mb-4"
          style={{ color: '#7a6050' }}
        >
          Menu Principal
        </p>
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                isActive ? 'text-white' : 'text-brown-300 hover:text-white'
              }`}
              style={
                isActive
                  ? { background: 'linear-gradient(135deg, #C9A227, #a8811a)', color: '#fff' }
                  : { color: '#c4a882' }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = '#3D2314';
                  (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = '#c4a882';
                }
              }}
            >
              <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && <ChevronRight size={14} className="text-white opacity-70" />}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-6 space-y-1 border-t" style={{ borderColor: '#3D2314', paddingTop: '16px' }}>
        <p
          className="text-xs font-semibold uppercase tracking-widest px-3 mb-3"
          style={{ color: '#7a6050' }}
        >
          Conta
        </p>
        {bottomItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={
                isActive
                  ? { background: 'linear-gradient(135deg, #C9A227, #a8811a)', color: '#fff' }
                  : { color: '#c4a882' }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = '#3D2314';
                  (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = '#c4a882';
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
