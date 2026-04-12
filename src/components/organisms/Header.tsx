// Organism: Header
import { Bell, Search } from 'lucide-react';
import PageHeader from '@atoms/PageHeader';
import SearchBar from '@atoms/SearchBar';
import Button from '@atoms/Button';

const viewTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Painel Geral', subtitle: 'Visão geral da empresa' },
  clients: { title: 'Clientes', subtitle: 'Gerenciar clientes e contratos' },
  events: { title: 'Eventos', subtitle: 'Agenda e histórico de eventos' },
  finances: { title: 'Finanças', subtitle: 'Controle financeiro' },
  debts: { title: 'Dívidas', subtitle: 'Contas a pagar e receber' },
  investments: { title: 'Investimentos', subtitle: 'Gestão de investimentos' },
  profile: { title: 'Perfil', subtitle: 'Informações da empresa' },
  settings: { title: 'Configurações', subtitle: 'Preferências do sistema' },
};

interface HeaderProps {
  activeView: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  onBellClick?: () => void;
  actions?: React.ReactNode;
}

export default function Header({ activeView }: HeaderProps) {
  const info = viewTitles[activeView] || { title: 'Painel', subtitle: '' };

  return (
    <PageHeader
      title={info.title}
      subtitle={info.subtitle}
      actions={
        <>
          <SearchBar
            value={
              typeof window !== 'undefined' &&
              typeof ((window as unknown as Record<string, unknown>).__HEADER_SEARCH__) === 'string'
                ? ((window as unknown as Record<string, unknown>).__HEADER_SEARCH__ as string)
                : ''
            }
            onChange={() => {}}
            placeholder="Pesquisar..."
            icon={<Search size={14} />}
            className="bg-[#f5ede8] text-[#7a4430]"
          />
          <Button
            variant="secondary"
            size="sm"
            style={{ position: 'relative', background: '#f5ede8', color: '#7a4430' }}
            onClick={() => {}}
          >
            <Bell size={16} />
            <span
              className="absolute top-1 right-1 w-2 h-2 rounded-full"
              style={{ background: '#C9A227' }}
            />
          </Button>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #C9A227, #a8811a)' }}
            >
              RC
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold" style={{ color: '#2C1810' }}>
                Royal Copeiras
              </p>
              <p className="text-xs" style={{ color: '#9a7060' }}>
                Administrador
              </p>
            </div>
          </div>
        </>
      }
    />
  );
}
