import {
  POSITION_NAME_MAX_LENGTH,
  POSITION_NAME_MIN_LENGTH,
} from "./constants";

export const positionUiCopy = {
  form: {
    createTitle: "Novo Cargo",
    editTitle: "Editar Cargo",
    invalidData: "Dados do formulário inválidos",
    labels: {
      name: "Nome do Cargo",
      createdAt: "Data de Criação",
      isActive: "Ativo",
    },
    placeholders: {
      name: "Ex.: Copeira Líder",
    },
  },
  listing: {
    title: "Cargos",
    newAction: "Novo Cargo",
    searchPlaceholder: "Buscar cargos...",
    emptyMessage: "Nenhum cargo encontrado",
    columns: {
      name: "Nome",
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
    invalidCollectionData: "Dados de cargos inválidos",
    invalidFormData: "Dados do formulário inválidos",
    invalidPositionData: "Dados do cargo inválidos",
    invalidPositionResponse: "Resposta de cargo inválida",
    loadPositionsFallback: "Erro ao carregar cargos",
    savePositionFallback: "Erro ao salvar cargo",
  },
  success: {
    createPosition: "Cargo criado com sucesso",
    updatePosition: "Cargo atualizado com sucesso",
  },
} as const;

export const positionValidationMessages = {
  nameRequired: "Nome obrigatório",
  nameMin: `Nome deve ter pelo menos ${POSITION_NAME_MIN_LENGTH} caracteres`,
  nameMax: `Nome deve ter no máximo ${POSITION_NAME_MAX_LENGTH} caracteres`,
} as const;
