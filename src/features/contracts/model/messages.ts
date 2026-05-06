export const contractUiCopy = {
  list: {
    title: "Contratos",
    description:
      "Gerencie os contratos vinculados a orçamentos aprovados e acompanhe o ciclo de assinatura.",
    searchPlaceholder: "Buscar por número ou orçamento",
    emptyMessage: "Nenhum contrato encontrado.",
    newAction: "Novo contrato",
    columns: {
      contractNumber: "Contrato",
      budgetNumber: "Orçamento",
      status: "Status",
      createdAt: "Criação",
      signatureStatus: "Assinatura",
      signedAt: "Assinado em",
      issueDate: "Emissão",
      validUntil: "Validade",
      actions: "Ações",
    },
  },
  form: {
    createTitle: "Novo contrato",
    editTitle: "Editar contrato",
    notices: {
      nonDraftLocked:
        "Este contrato não pode ser editado pois já foi processado. Apenas contratos em rascunho podem ser alterados.",
    },
    signature: {
      title: "Dados da assinatura",
      provider: "Provedor",
      envelope: "Envelope",
      status: "Status da assinatura",
      signedAt: "Assinado em",
      signerName: "Nome do signatário",
      signerEmail: "E-mail do signatário",
      signerDocument: "Documento do signatário",
      signerIp: "IP do signatário",
      unknown: "Nao informado",
      actions: {
        request: "Solicitar assinatura",
        refresh: "Atualizar status",
        cancel: "Cancelar assinatura",
      },
    },
    options: {
      draft: "Rascunho",
      generated: "Gerado",
      pending_signature: "Pendente assinatura",
      signed: "Assinado",
      rejected: "Rejeitado",
      expired: "Expirado",
      canceled: "Cancelado",
    },
  },
  success: {
    createContract: "Contrato criado com sucesso",
    updateContract: "Contrato atualizado com sucesso",
    previewContract: "Preview do contrato gerado com sucesso",
  },
  errors: {
    loadContractsFallback: "Erro ao carregar contratos",
    loadBudgetsFallback: "Erro ao carregar orçamentos aprovados",
    saveContractFallback: "Erro ao salvar contrato",
    previewContractFallback: "Erro ao gerar preview do contrato",
    invalidContractData: "Dados de contrato inválidos",
  },
} as const;
