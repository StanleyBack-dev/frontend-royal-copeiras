import { SUPPLY_NAME_MAX_LENGTH, SUPPLY_NAME_MIN_LENGTH } from "./constants";

export const supplyUiCopy = {
  form: {
    createTitle: "Novo Material",
    editTitle: "Editar Material",
    invalidData: "Dados do formulário inválidos",
    labels: {
      name: "Nome do Material",
      defaultUnit: "Unidade padrão",
      suggestedUnitPrice: "Valor unitário sugerido (R$)",
      createdAt: "Data de Criação",
      isActive: "Ativo",
    },
    placeholders: {
      name: "Ex.: Papel higiênico",
      defaultUnit: "Ex.: rolo, fardo, pacote",
      suggestedUnitPrice: "Ex.: 12.90",
    },
  },
  listing: {
    title: "Materiais",
    newAction: "Novo Material",
    searchPlaceholder: "Buscar materiais...",
    emptyMessage: "Nenhum material encontrado",
    columns: {
      name: "Nome",
      defaultUnit: "Unidade",
      isActive: "Ativo",
      createdAt: "Criação",
      actions: "Editar",
    },
    values: {
      active: "Sim",
      inactive: "Não",
    },
    actions: {
      edit: "Editar",
    },
  },
  errors: {
    invalidCollectionData: "Dados de materiais inválidos",
    invalidFormData: "Dados do formulário inválidos",
    invalidSupplyData: "Dados do material inválidos",
    invalidSupplyResponse: "Resposta de material inválida",
    loadSuppliesFallback: "Erro ao carregar materiais",
    saveSupplyFallback: "Erro ao salvar material",
  },
  success: {
    createSupply: "Material criado com sucesso",
    updateSupply: "Material atualizado com sucesso",
  },
} as const;

export const supplyValidationMessages = {
  nameRequired: "Nome obrigatório",
  nameMin: `Nome deve ter pelo menos ${SUPPLY_NAME_MIN_LENGTH} caracteres`,
  nameMax: `Nome deve ter no máximo ${SUPPLY_NAME_MAX_LENGTH} caracteres`,
} as const;
