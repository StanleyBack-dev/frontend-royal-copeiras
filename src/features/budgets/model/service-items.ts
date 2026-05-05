export const budgetServiceTypeOptions = [
  "Garçom",
  "Copeira",
  "Porteiro",
  "Segurança",
  "Monitor",
  "Recepcionista",
] as const;

export type BudgetServiceType = (typeof budgetServiceTypeOptions)[number];

export const serviceGenderOptions = ["Masculino", "Feminino"] as const;
export type ServiceGenderOption = (typeof serviceGenderOptions)[number];

interface ServiceMeta {
  singularLower: string;
  pluralLower: string;
  gender: "masculine" | "feminine";
}

/** Grammar-level gender and labels for each (baseType × ServiceGenderOption) combination */
const SERVICE_GENDER_META: Record<
  BudgetServiceType,
  Record<ServiceGenderOption, ServiceMeta>
> = {
  Garçom: {
    Masculino: {
      singularLower: "garçom",
      pluralLower: "garçons",
      gender: "masculine",
    },
    Feminino: {
      singularLower: "garçonete",
      pluralLower: "garçonetes",
      gender: "feminine",
    },
  },
  Copeira: {
    Masculino: {
      singularLower: "copeiro",
      pluralLower: "copeiros",
      gender: "masculine",
    },
    Feminino: {
      singularLower: "copeira",
      pluralLower: "copeiras",
      gender: "feminine",
    },
  },
  Porteiro: {
    Masculino: {
      singularLower: "porteiro",
      pluralLower: "porteiros",
      gender: "masculine",
    },
    Feminino: {
      singularLower: "porteira",
      pluralLower: "porteiras",
      gender: "feminine",
    },
  },
  Segurança: {
    Masculino: {
      singularLower: "segurança",
      pluralLower: "seguranças",
      gender: "masculine",
    },
    Feminino: {
      singularLower: "segurança",
      pluralLower: "seguranças",
      gender: "feminine",
    },
  },
  Monitor: {
    Masculino: {
      singularLower: "monitor",
      pluralLower: "monitores",
      gender: "masculine",
    },
    Feminino: {
      singularLower: "monitora",
      pluralLower: "monitoras",
      gender: "feminine",
    },
  },
  Recepcionista: {
    Masculino: {
      singularLower: "recepcionista",
      pluralLower: "recepcionistas",
      gender: "masculine",
    },
    Feminino: {
      singularLower: "recepcionista",
      pluralLower: "recepcionistas",
      gender: "feminine",
    },
  },
};

/** Default gender option for each base service type (used for new items) */
export const DEFAULT_SERVICE_GENDER: Record<
  BudgetServiceType,
  ServiceGenderOption
> = {
  Garçom: "Masculino",
  Copeira: "Feminino",
  Porteiro: "Masculino",
  Segurança: "Masculino",
  Monitor: "Masculino",
  Recepcionista: "Feminino",
};

/** Total number of available (type × gender) combinations */
export const TOTAL_SERVICE_COMBOS =
  budgetServiceTypeOptions.length * serviceGenderOptions.length;

/** Returns the combo key used for uniqueness checks */
export function serviceComboKey(
  serviceType: BudgetServiceType | "",
  gender: ServiceGenderOption | "",
): string {
  return `${serviceType}:${gender}`;
}

const SERVICE_META: Record<BudgetServiceType, ServiceMeta> = {
  Garçom: {
    singularLower: "garçom",
    pluralLower: "garçons",
    gender: "masculine",
  },
  Copeira: {
    singularLower: "copeira",
    pluralLower: "copeiras",
    gender: "feminine",
  },
  Porteiro: {
    singularLower: "porteiro",
    pluralLower: "porteiros",
    gender: "masculine",
  },
  Segurança: {
    singularLower: "segurança",
    pluralLower: "seguranças",
    gender: "masculine",
  },
  Monitor: {
    singularLower: "monitor",
    pluralLower: "monitores",
    gender: "masculine",
  },
  Recepcionista: {
    singularLower: "recepcionista",
    pluralLower: "recepcionistas",
    gender: "feminine",
  },
};

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function toPtBrNumberWords(
  value: number,
  gender: "masculine" | "feminine" = "masculine",
): string {
  const units = [
    "zero",
    "um",
    "dois",
    "três",
    "quatro",
    "cinco",
    "seis",
    "sete",
    "oito",
    "nove",
  ];
  const teens = [
    "dez",
    "onze",
    "doze",
    "treze",
    "quatorze",
    "quinze",
    "dezesseis",
    "dezessete",
    "dezoito",
    "dezenove",
  ];
  const tens = [
    "",
    "",
    "vinte",
    "trinta",
    "quarenta",
    "cinquenta",
    "sessenta",
    "setenta",
    "oitenta",
    "noventa",
  ];
  const hundreds = [
    "",
    "cento",
    "duzentos",
    "trezentos",
    "quatrocentos",
    "quinhentos",
    "seiscentos",
    "setecentos",
    "oitocentos",
    "novecentos",
  ];

  if (!Number.isFinite(value) || value < 0 || value > 999) {
    return String(value);
  }

  if (value === 1) return gender === "feminine" ? "uma" : "um";
  if (value === 2) return gender === "feminine" ? "duas" : "dois";
  if (value < 10) return units[value];
  if (value < 20) return teens[value - 10];

  const hundred = Math.floor(value / 100);
  const rest = value % 100;

  const toTens = (num: number): string => {
    if (num === 1) return gender === "feminine" ? "uma" : "um";
    if (num === 2) return gender === "feminine" ? "duas" : "dois";
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return unit ? `${tens[ten]} e ${units[unit]}` : tens[ten];
  };

  if (value === 100) return "cem";

  if (!hundred) {
    return toTens(rest);
  }

  if (!rest) {
    return hundreds[hundred];
  }

  return `${hundreds[hundred]} e ${toTens(rest)}`;
}

function resolveServiceMeta(
  type: BudgetServiceType,
  genderOption?: ServiceGenderOption,
): ServiceMeta {
  const effectiveGender = genderOption ?? DEFAULT_SERVICE_GENDER[type];
  return SERVICE_GENDER_META[type][effectiveGender];
}

function serviceLower(
  type: BudgetServiceType,
  quantity: number,
  genderOption?: ServiceGenderOption,
): string {
  const meta = resolveServiceMeta(type, genderOption);
  return quantity === 1 ? meta.singularLower : meta.pluralLower;
}

export function buildBudgetServiceDescription(
  type: BudgetServiceType,
  quantity: number,
  genderOption?: ServiceGenderOption,
): string {
  const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  const meta = resolveServiceMeta(type, genderOption);
  const quantityWords = toPtBrNumberWords(safeQuantity, meta.gender);
  const lowerService = serviceLower(type, safeQuantity, genderOption);

  const FRAGMENTS: Record<string, string> = {
    copeira:
      "manter o ambiente limpo e organizado, incluindo salão, auditório e banheiros, com reposição de materiais e higienização",
    garcom:
      "atender mesas, servir alimentos e bebidas, anotar pedidos e retirar utensílios",
    garçom:
      "atender mesas, servir alimentos e bebidas, anotar pedidos e retirar utensílios",
    seguranca:
      "controlar acessos, patrulhar áreas e zelar pela segurança de pessoas e bens",
    porteiro:
      "controlar entradas e saídas, orientar visitantes e supervisionar a guarda de acessos",
    recepcionista:
      "realizar credenciamento, acolhimento e orientação aos convidados",
    monitor:
      "supervisionar atividades e apoiar a operação em áreas ou públicos específicos",
  };

  const fragment =
    FRAGMENTS[normalizeText(String(type))] ||
    "atuar durante o evento, com foco na execucao do servico contratado";

  return [
    `Prestação de serviço de ${safeQuantity} (${quantityWords}) ${lowerService}`,
    `para atuação durante o evento, com foco em ${fragment}.`,
  ].join("\n");
}

export function sanitizeBudgetServiceDescription(description: string): string {
  const trimmed = description.trim();
  const canonicalMatch = trimmed.match(
    /^(Prestação de serviço de[\s\S]*?execução do serviço contratado\.)/i,
  );

  if (canonicalMatch) {
    return canonicalMatch[1].trim();
  }

  const fallbackMatch = trimmed.match(
    /^(Prestacao de servico de[\s\S]*?execucao do servico contratado\.)/i,
  );

  if (fallbackMatch) {
    return fallbackMatch[1].trim();
  }

  return trimmed;
}

export function inferBudgetServiceType(
  description: string,
): BudgetServiceType | "" {
  const normalized = normalizeText(description);

  for (const option of budgetServiceTypeOptions) {
    for (const genderOption of serviceGenderOptions) {
      const meta = SERVICE_GENDER_META[option][genderOption];
      if (
        normalized.includes(normalizeText(meta.singularLower)) ||
        normalized.includes(normalizeText(meta.pluralLower))
      ) {
        return option;
      }
    }
  }

  return "";
}

export function inferServiceGenderFromDescription(
  description: string,
  baseType: BudgetServiceType,
): ServiceGenderOption {
  const normalized = normalizeText(description);
  for (const genderOption of serviceGenderOptions) {
    const meta = SERVICE_GENDER_META[baseType][genderOption];
    if (
      normalized.includes(normalizeText(meta.singularLower)) ||
      normalized.includes(normalizeText(meta.pluralLower))
    ) {
      return genderOption;
    }
  }
  return DEFAULT_SERVICE_GENDER[baseType];
}

export function getServiceLabels(type: BudgetServiceType): {
  singular: string;
  plural: string;
} {
  const meta = SERVICE_META[type];
  return { singular: meta.singularLower, plural: meta.pluralLower };
}

export function getServiceGender(
  type: BudgetServiceType,
): "masculine" | "feminine" {
  return SERVICE_META[type].gender;
}
