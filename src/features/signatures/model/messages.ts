export const signatureUiCopy = {
  list: {
    title: "Assinaturas",
    description:
      "Acompanhe solicitações de assinatura digital vinculadas aos contratos.",
    searchPlaceholder: "Buscar por contrato ou signatário",
    emptyMessage: "Nenhuma assinatura encontrada.",
    columns: {
      contractNumber: "Contrato",
      signer: "Signatario",
      provider: "Provedor",
      signedByDocument: "Documento",
      signedByEmail: "E-mail do signatário",
      signatureStatus: "Status da assinatura",
      signedAt: "Assinado em",
      signatureUrl: "URL da assinatura",
      contractStatus: "Status do contrato",
      updatedAt: "Última atualização",
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
