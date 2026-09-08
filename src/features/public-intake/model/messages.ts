export const publicIntakeUiCopy = {
  list: {
    title: "Links de Orçamento",
    description:
      "Gere um código temporário e envie para o cliente preencher os dados do orçamento sozinho, sem precisar digitar tudo por ele.",
    emptyMessage: "Nenhum código gerado ainda.",
    columns: {
      code: "Código",
      status: "Status",
      expiresAt: "Expira em",
      result: "Resultado",
      createdAt: "Gerado em",
    },
    generateAction: "Gerar código",
  },
  generateDialog: {
    title: "Código gerado",
    description:
      "Envie o link e o código abaixo para o cliente pelo WhatsApp. O código vale até a data indicada e só pode ser usado uma vez.",
    linkLabel: "Link do formulário",
    codeLabel: "Código",
    expiresAtLabel: "Válido até",
    shareWhatsApp: "Enviar pelo WhatsApp",
    copyMessage: "Copiar mensagem",
  },
  success: {
    generated: "Código gerado com sucesso",
    copied: "Mensagem copiada",
  },
  errors: {
    loadFallback: "Erro ao carregar códigos",
    generateFallback: "Erro ao gerar código",
  },
} as const;
