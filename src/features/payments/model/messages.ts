export const paymentUiCopy = {
  list: {
    title: "Pagamentos",
    description:
      "Controle pagamentos pendentes e liquidados de orçamentos e contratos com rastreabilidade financeira.",
    searchPlaceholder: "Buscar pagamentos...",
    emptyMessage: "Nenhum pagamento encontrado.",
    newAction: "Novo pagamento",
    columns: {
      actions: "Ações",
      eventNumber: "Evento",
      contractNumber: "Contrato",
      budgetNumber: "Orçamento",
      customerName: "Cliente",
      status: "Status",
      origin: "Tipos de pagamento",
      plannedAmount: "Valor previsto",
      paidAmount: "Valor pago",
      dueDate: "Vencimento",
      paymentDate: "Data de pagamento",
      notes: "Observações",
      createdAt: "Criação",
    },
  },
  form: {
    createTitle: "Novo pagamento",
    editTitle: "Editar pagamento",
    labels: {
      idLeads: "Lead",
      idBudgets: "Orçamento",
      idContracts: "Contrato",
      idEvents: "Evento",
      origin: "Origem",
      plannedAmount: "Valor previsto",
      debtorBalance: "Saldo devedor",
      status: "Status",
      paidAmount: "Valor pago",
      dueDate: "Vencimento",
      paymentDate: "Data de pagamento",
      proofUrl: "URL do comprovante",
      notes: "Observações",
    },
    placeholders: {
      lead: "Selecione um lead",
      budget: "Selecione um orçamento",
      contract: "Selecione um contrato",
      event: "Ex.: EVT-2026-001",
      plannedAmount: "R$ 0,00",
      paidAmount: "R$ 0,00",
      proofUrl: "https://...",
      notes: "Digite suas observações aqui...",
    },
    sections: {
      infoSection: "Informações do pagamento",
      itemsTitle: "Tipos de pagamento",
      itemsDescription:
        "Estruture os tipos de pagamento do registro em linhas independentes para facilitar revisão e acompanhamento financeiro.",
      totalItem: "Total do item",
      itemNotes: "Observações do tipo",
    },
    options: {
      statuses: {
        pendente: "Pendente",
        parcial: "Parcial",
        pago: "Pago",
        cancelado: "Cancelado",
      },
      origins: {
        budget_advance: "Entrada do orçamento",
        budget_total: "Total do orçamento",
        contract: "Contrato",
        material: "Material",
        overtime: "Hora extra",
      },
    },
    actions: {
      back: "Voltar",
      addItem: "Adicionar tipo",
      removeItem: "Remover",
    },
    notices: {
      loadingPayment: "Carregando dados do pagamento...",
      loadSelectedPaymentFallback:
        "Não foi possível carregar o pagamento selecionado.",
      missingPaymentForUpdate:
        "Não foi possível identificar o pagamento para atualização.",
      partialReachedTotal:
        "O valor pago atingiu o total previsto. Altere o status para Pago.",
    },
  },
  errors: {
    invalidCollectionData: "Dados de pagamentos inválidos",
    invalidPaymentData: "Dados do pagamento inválidos",
    invalidPaymentResponse: "Resposta de pagamento inválida",
    invalidFormData: "Dados do formulário inválidos",
    loadPaymentsFallback: "Erro ao carregar pagamentos",
    savePaymentFallback: "Erro ao salvar pagamento",
    loadCollectionFallback: "Erro ao carregar dados para pagamentos",
    loadBudgetsFallback: "Erro ao carregar orçamentos para pagamentos",
    loadContractsFallback: "Erro ao carregar contratos para pagamentos",
  },
  success: {
    createPayment: "Pagamento criado com sucesso",
    updatePayment: "Pagamento atualizado com sucesso",
  },
} as const;

export const paymentValidationMessages = {
  leadRequired: "Selecione um lead.",
  contractOrEventRequired: "Informe um contrato ou um evento.",
  reviewRequiredFields: "Revise os campos obrigatórios.",
  statusRequired: "Informe o status em todos os tipos de pagamento.",
  zeroPaidAmountRequired:
    "Quando o status for Pendente ou Cancelado, o valor pago deve ser R$ 0,00.",
  partialPaidAmountMustBeLowerThanPlanned:
    "Quando o status for Parcial, o valor pago deve ser menor que o valor previsto.",
  paymentDateRequired:
    "Informe a data de pagamento em todos os tipos de pagamento.",
  paidAmountRequired: "Informe o valor pago em todos os tipos de pagamento.",
  itemsRequired:
    "Adicione pelo menos um tipo de pagamento com valor previsto maior que zero.",
} as const;
