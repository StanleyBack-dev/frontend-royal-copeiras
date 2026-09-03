import type { ActiveView } from "../../types/views";

export const viewTitles: Record<
  ActiveView,
  { title: string; subtitle: string }
> = {
  dashboard: { title: "Painel Geral", subtitle: "Visão geral da empresa" },
  leads: { title: "Leads", subtitle: "Gerenciar oportunidades comerciais" },
  budgets: { title: "Orçamentos", subtitle: "Gerenciar propostas comerciais" },
  contracts: { title: "Contratos", subtitle: "Gerenciar contratos jurídicos" },
  signatures: {
    title: "Assinaturas",
    subtitle: "Acompanhar solicitacoes de assinatura",
  },
  payments: { title: "Pagamentos", subtitle: "Controle de pagamentos" },
  clients: { title: "Clientes", subtitle: "Gerenciar clientes" },
  employees: {
    title: "Funcionários",
    subtitle: "Gerenciar colaboradores",
  },
  positions: {
    title: "Cargos",
    subtitle: "Gerenciar cargos da equipe",
  },
  users: {
    title: "Usuários",
    subtitle: "Gerenciar usuários de acesso",
  },
  events: { title: "Eventos", subtitle: "Agenda e histórico de eventos" },
  profile: { title: "Perfil", subtitle: "Informações da empresa" },
};
