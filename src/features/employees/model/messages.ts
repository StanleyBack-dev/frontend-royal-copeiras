import {
  EMPLOYEE_DOCUMENT_CNPJ_DIGITS,
  EMPLOYEE_DOCUMENT_CPF_DIGITS,
  EMPLOYEE_EMAIL_MAX_LENGTH,
  EMPLOYEE_EMAIL_MIN_LENGTH,
  EMPLOYEE_NAME_MAX_LENGTH,
  EMPLOYEE_POSITION_MAX_LENGTH,
  EMPLOYEE_POSITION_MIN_LENGTH,
} from "./constants";

export const employeeUiCopy = {
  form: {
    createTitle: "Novo Funcionário",
    editTitle: "Editar Funcionário",
    invalidData: "Dados do formulário inválidos",
    labels: {
      name: "Nome",
      createdAt: "Data de Criação",
      type: "Tipo",
      cpf: "CPF",
      cnpj: "CNPJ",
      contactType: "Tipo de Telefone",
      position: "Cargo",
      phone: "Telefone",
      email: "Email",
      isActive: "Ativo",
    },
    placeholders: {
      name: "Ana Paula de Souza",
      cpf: "123.456.789-09",
      cnpj: "12.345.678/0001-90",
      position: "Copeira Líder",
      mobilePhone: "(11) 91234-5678",
      landlinePhone: "(11) 3456-7890",
      email: "ana.souza@empresa.com",
    },
    options: {
      person: "Pessoa Física",
      company: "Empresa",
      mobile: "Móvel",
      landline: "Fixo",
    },
  },
  listing: {
    title: "Funcionários",
    newAction: "Novo Funcionário",
    searchPlaceholder: "Buscar funcionários...",
    emptyMessage: "Nenhum funcionário encontrado",
    columns: {
      name: "Nome",
      document: "Documento",
      position: "Cargo",
      email: "Email",
      phone: "Telefone",
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
    invalidCollectionData: "Dados de funcionários inválidos",
    invalidFormData: "Dados do formulário inválidos",
    invalidEmployeeData: "Dados do funcionário inválidos",
    invalidEmployeeResponse: "Resposta de funcionário inválida",
    loadEmployeesFallback: "Erro ao carregar funcionários",
    saveEmployeeFallback: "Erro ao salvar funcionário",
  },
  success: {
    createEmployee: "Funcionário criado com sucesso",
    updateEmployee: "Funcionário atualizado com sucesso",
  },
} as const;

export const employeeValidationMessages = {
  nameRequired: "Nome obrigatório",
  nameMax: `Nome deve ter no máximo ${EMPLOYEE_NAME_MAX_LENGTH} caracteres`,
  documentInvalid: `Documento deve ter ${EMPLOYEE_DOCUMENT_CPF_DIGITS} ou ${EMPLOYEE_DOCUMENT_CNPJ_DIGITS} dígitos`,
  emailMin: `E-mail deve ter pelo menos ${EMPLOYEE_EMAIL_MIN_LENGTH} caracteres`,
  emailMax: `E-mail deve ter no máximo ${EMPLOYEE_EMAIL_MAX_LENGTH} caracteres`,
  emailInvalid: "E-mail inválido",
  phoneInvalid: "Telefone móvel deve ter 11 dígitos e fixo deve ter 10 dígitos",
  positionRequired: "Cargo obrigatório",
  positionMin: `Cargo deve ter pelo menos ${EMPLOYEE_POSITION_MIN_LENGTH} caracteres`,
  positionMax: `Cargo deve ter no máximo ${EMPLOYEE_POSITION_MAX_LENGTH} caracteres`,
  cpfInvalid: `CPF deve ter ${EMPLOYEE_DOCUMENT_CPF_DIGITS} dígitos`,
  cnpjInvalid: `CNPJ deve ter ${EMPLOYEE_DOCUMENT_CNPJ_DIGITS} dígitos`,
} as const;
