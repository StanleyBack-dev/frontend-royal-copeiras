export const signatureUiCopy = {
  list: {
    title: "Assinaturas",
    description:
      "Acompanhe solicitações de assinatura digital vinculadas aos contratos.",
    searchPlaceholder: "Buscar por contrato, envelope ou signatário",
    emptyMessage: "Nenhuma assinatura encontrada.",
    columns: {
      contractNumber: "Contrato",
      signer: "Signatario",
      provider: "Provedor",
      envelope: "Envelope",
      signatureStatus: "Status da assinatura",
      contractStatus: "Status do contrato",
      updatedAt: "Última atualização",
      actions: "Ações",
    },
  },
  filters: {
    allStatuses: "Todos os status",
    allProviders: "Todos os provedores",
    allTypes: "Todos os tipos",
  },
  actions: {
    refreshStatus: "Atualizar status",
    cancelRequest: "Cancelar assinatura",
    openContract: "Abrir contrato",
  },
  success: {
    refreshed: "Status da assinatura atualizado",
    cancelled: "Solicitação cancelada com sucesso",
  },
  errors: {
    loadFallback: "Erro ao carregar assinaturas",
    updateFallback: "Erro ao atualizar assinatura",
  },
} as const;
