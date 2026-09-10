import type { CompanyProfile } from "@/api/company-profile/schema";
import type { ContractParty } from "@/api/contracts/schema";

/**
 * Every editable company-profile field, as strings (form friendly).
 * The contract "contractor" override reuses the same keys minus `website`.
 */
export type CompanyProfileFormValues = {
  legalName: string;
  tradeName: string;
  document: string;
  stateRegistration: string;
  municipalRegistration: string;
  email: string;
  phone: string;
  address: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  representativeName: string;
  representativeRole: string;
  representativeDocument: string;
  pixKey: string;
  pixKeyType: string;
  issueCity: string;
  website: string;
};

export type CompanyProfileFieldKey = keyof CompanyProfileFormValues;

/** Keys that also exist on the per-contract CONTRATADA override. */
export const CONTRACTOR_FIELD_KEYS = [
  "legalName",
  "tradeName",
  "document",
  "stateRegistration",
  "municipalRegistration",
  "email",
  "phone",
  "address",
  "addressCity",
  "addressState",
  "addressZipCode",
  "representativeName",
  "representativeRole",
  "representativeDocument",
  "pixKey",
  "pixKeyType",
  "issueCity",
] as const satisfies readonly CompanyProfileFieldKey[];

export type ContractorFieldKey = (typeof CONTRACTOR_FIELD_KEYS)[number];

export const EMPTY_COMPANY_PROFILE_FORM_VALUES: CompanyProfileFormValues = {
  legalName: "",
  tradeName: "",
  document: "",
  stateRegistration: "",
  municipalRegistration: "",
  email: "",
  phone: "",
  address: "",
  addressCity: "",
  addressState: "",
  addressZipCode: "",
  representativeName: "",
  representativeRole: "",
  representativeDocument: "",
  pixKey: "",
  pixKeyType: "",
  issueCity: "",
  website: "",
};

export const PIX_KEY_TYPE_LABELS: Record<string, string> = {
  cnpj: "CNPJ",
  cpf: "CPF",
  email: "E-mail",
  phone: "Telefone",
  random: "Chave aleatória",
};

interface FieldDefinition {
  key: CompanyProfileFieldKey;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "pixKeyType";
  span?: 1 | 2;
}

export interface FieldGroup {
  id: string;
  title: string;
  description?: string;
  fields: FieldDefinition[];
}

export const COMPANY_PROFILE_FIELD_GROUPS: FieldGroup[] = [
  {
    id: "identification",
    title: "Identificação",
    description:
      "Deve refletir exatamente o cadastro do CNPJ na Receita Federal.",
    fields: [
      {
        key: "legalName",
        label: "Razão social *",
        placeholder: "Nome registrado no CNPJ",
        span: 2,
      },
      {
        key: "tradeName",
        label: "Nome fantasia *",
        placeholder: "Royal Copeiras",
      },
      { key: "document", label: "CNPJ *", placeholder: "00.000.000/0000-00" },
      { key: "stateRegistration", label: "Inscrição estadual" },
      { key: "municipalRegistration", label: "Inscrição municipal" },
    ],
  },
  {
    id: "contact",
    title: "Contato",
    fields: [
      { key: "email", label: "E-mail", type: "email" },
      { key: "phone", label: "Telefone" },
      { key: "website", label: "Site" },
    ],
  },
  {
    id: "address",
    title: "Endereço (sede)",
    fields: [
      { key: "address", label: "Logradouro", span: 2 },
      { key: "addressCity", label: "Cidade" },
      { key: "addressState", label: "UF", placeholder: "GO" },
      { key: "addressZipCode", label: "CEP", placeholder: "00000-000" },
    ],
  },
  {
    id: "representative",
    title: "Representante legal",
    description: "Assinante do contrato em nome da empresa.",
    fields: [
      { key: "representativeName", label: "Nome do representante", span: 2 },
      { key: "representativeRole", label: "Cargo", placeholder: "Titular" },
      { key: "representativeDocument", label: "CPF do representante" },
    ],
  },
  {
    id: "payment",
    title: "Pagamento e emissão",
    fields: [
      { key: "pixKey", label: "Chave PIX" },
      { key: "pixKeyType", label: "Tipo da chave PIX", type: "pixKeyType" },
      {
        key: "issueCity",
        label: "Cidade de emissão / foro",
        placeholder: "Goiânia",
      },
    ],
  },
];

const CONTRACTOR_FIELD_KEY_SET = new Set<string>(CONTRACTOR_FIELD_KEYS);

/** Same groups as the company profile, limited to the per-contract override. */
export const CONTRACTOR_FIELD_GROUPS: FieldGroup[] =
  COMPANY_PROFILE_FIELD_GROUPS.map((group) => ({
    ...group,
    fields: group.fields.filter((field) =>
      CONTRACTOR_FIELD_KEY_SET.has(field.key),
    ),
  })).filter((group) => group.fields.length > 0);

export function mapProfileToFormValues(
  profile: CompanyProfile,
): CompanyProfileFormValues {
  const values = { ...EMPTY_COMPANY_PROFILE_FORM_VALUES };
  for (const key of Object.keys(values) as CompanyProfileFieldKey[]) {
    const raw = profile[key];
    values[key] = typeof raw === "string" ? raw : "";
  }
  return values;
}

export function mapFormValuesToUpdatePayload(
  values: CompanyProfileFormValues,
): Record<string, string> {
  const payload: Record<string, string> = {};
  for (const key of Object.keys(values) as CompanyProfileFieldKey[]) {
    payload[key] = values[key].trim();
  }
  return payload;
}

/** Trims contractor form values into an API payload object. */
export function contractorValuesToPayload(
  values: ContractorValues,
): Record<ContractorFieldKey, string> {
  const result = {} as Record<ContractorFieldKey, string>;
  for (const key of CONTRACTOR_FIELD_KEYS) {
    result[key] = values[key].trim();
  }
  return result;
}

/** Builds the CONTRATADA override values from the company profile defaults. */
export function mapProfileToContractorValues(
  profile: CompanyProfile | null,
): Record<ContractorFieldKey, string> {
  const result = {} as Record<ContractorFieldKey, string>;
  for (const key of CONTRACTOR_FIELD_KEYS) {
    const raw = profile?.[key];
    result[key] = typeof raw === "string" ? raw : "";
  }
  return result;
}

export type ContractorValues = Record<ContractorFieldKey, string>;

const DEFAULT_TRADE_NAME = "Royal Copeiras";
const DEFAULT_DOCUMENT = "64.062.038/0001-71";
const DEFAULT_ISSUE_CITY = "Goiânia";

export function contractorTradeName(values: ContractorValues): string {
  return (
    values.tradeName.trim() || values.legalName.trim() || DEFAULT_TRADE_NAME
  );
}

export function contractorIssueCity(values: ContractorValues): string {
  return (
    values.issueCity.trim() || values.addressCity.trim() || DEFAULT_ISSUE_CITY
  );
}

/**
 * Payment reference used in the contract payment clause — always followed by
 * the PIX key holder's name (representante, falling back to razão social):
 * "CNPJ 64.062.038/0001-71 - Estevam Barros Rodrigues".
 */
export function contractorPaymentReference(values: ContractorValues): string {
  const document = values.document.trim();
  const pixKey = values.pixKey.trim();
  const pixKeyType = values.pixKeyType.trim().toLowerCase();
  const ownerName = values.representativeName.trim() || values.legalName.trim();
  const ownerSuffix = ownerName ? ` - ${ownerName}` : "";

  if (pixKey && pixKeyType === "cnpj") {
    return `CNPJ ${pixKey}${ownerSuffix}`;
  }

  if (pixKey && pixKeyType === "cpf") {
    return `CPF ${pixKey}${ownerSuffix}`;
  }

  if (pixKey) {
    return `chave PIX ${pixKey}${ownerSuffix}`;
  }

  if (document) {
    return `CNPJ ${document}${ownerSuffix}`;
  }

  return `CNPJ ${DEFAULT_DOCUMENT}${ownerSuffix}`;
}

/** Builds the CONTRATADA override values from a contract's frozen snapshot. */
export function mapContractPartyToContractorValues(
  party: ContractParty | undefined,
  fallback: Record<ContractorFieldKey, string>,
): Record<ContractorFieldKey, string> {
  const result = {} as Record<ContractorFieldKey, string>;
  for (const key of CONTRACTOR_FIELD_KEYS) {
    const raw = party?.[key];
    result[key] =
      typeof raw === "string" && raw.trim().length > 0 ? raw : fallback[key];
  }
  return result;
}
