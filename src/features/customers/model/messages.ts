import {
  CUSTOMER_ADDRESS_MAX_LENGTH,
  CUSTOMER_ADDRESS_MIN_LENGTH,
  CUSTOMER_CNPJ_DIGITS,
  CUSTOMER_CPF_DIGITS,
  CUSTOMER_EMAIL_MAX_LENGTH,
  CUSTOMER_EMAIL_MIN_LENGTH,
  CUSTOMER_NAME_MAX_LENGTH,
} from "./constants";

export const customerUiCopy = {
  form: {
    createTitle: "Novo Cliente",
    editTitle: "Editar Cliente",
    invalidData: "Dados do formulário inválidos",
    labels: {
      name: "Nome",
      type: "Tipo",
      cpf: "CPF",
      cnpj: "CNPJ",
      contactType: "Tipo de Telefone",
      phone: "Telefone",
      email: "Email",
      address: "Endereço",
      isActive: "Ativo",
    },
    placeholders: {
      name: "Maria Aparecida da Silva",
      cpf: "123.456.789-09",
      cnpj: "12.345.678/0001-90",
      mobilePhone: "(11) 91234-5678",
      landlinePhone: "(11) 3456-7890",
      email: "maria.silva@empresa.com",
      address: "Rua das Flores, 123 - Centro",
    },
    options: {
      person: "Pessoa Física",
      company: "Empresa",
      mobile: "Móvel",
      landline: "Fixo",
    },
  },
  listing: {
    title: "Clientes",
    newAction: "Novo Cliente",
    searchPlaceholder: "Buscar clientes...",
    emptyMessage: "Nenhum cliente encontrado",
    confirmDelete: "Excluir este cliente?",
    columns: {
      name: "Nome",
      document: "Documento",
      type: "Tipo",
      email: "Email",
      phone: "Telefone",
      isActive: "Ativo",
      actions: "Ações",
    },
    values: {
      active: "Sim",
      inactive: "Não",
    },
    actions: {
      edit: "Editar",
      delete: "Excluir",
    },
  },
  errors: {
    invalidCollectionData: "Dados de clientes inválidos",
    invalidFormData: "Dados do formulário inválidos",
    invalidCustomerData: "Dados do cliente inválidos",
    invalidCustomerResponse: "Resposta de cliente inválida",
    loadCustomersFallback: "Erro ao carregar clientes",
    saveCustomerFallback: "Erro ao salvar cliente",
  },
  success: {
    createCustomer: "Cliente criado com sucesso",
    updateCustomer: "Cliente atualizado com sucesso",
  },
} as const;

export const customerValidationMessages = {
  nameRequired: "Nome obrigatório",
  nameMax: `Nome deve ter no máximo ${CUSTOMER_NAME_MAX_LENGTH} caracteres`,
  emailMin: `E-mail deve ter pelo menos ${CUSTOMER_EMAIL_MIN_LENGTH} caracteres`,
  emailMax: `E-mail deve ter no máximo ${CUSTOMER_EMAIL_MAX_LENGTH} caracteres`,
  emailInvalid: "E-mail inválido",
  phoneInvalid: "Telefone móvel deve ter 11 dígitos e fixo deve ter 10 dígitos",
  addressMin: `Endereço deve ter pelo menos ${CUSTOMER_ADDRESS_MIN_LENGTH} caracteres`,
  addressMax: `Endereço deve ter no máximo ${CUSTOMER_ADDRESS_MAX_LENGTH} caracteres`,
  cpfInvalid: `CPF deve ter ${CUSTOMER_CPF_DIGITS} dígitos`,
  cnpjInvalid: `CNPJ deve ter ${CUSTOMER_CNPJ_DIGITS} dígitos`,
  apiPhoneInvalid: "Telefone deve ter 10 ou 11 dígitos",
} as const;
