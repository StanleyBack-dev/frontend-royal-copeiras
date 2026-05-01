export const budgetServiceTypeOptions = [
  "Garçom",
  "Copeira",
  "Porteiro",
  "Segurança",
  "Monitor",
  "Recepcionista",
] as const;

export type BudgetServiceType = (typeof budgetServiceTypeOptions)[number];

interface ServiceMeta {
  singularLower: string;
  pluralLower: string;
}

const SERVICE_META: Record<BudgetServiceType, ServiceMeta> = {
  Garçom: {
    singularLower: "garçom",
    pluralLower: "garçons",
  },
  Copeira: {
    singularLower: "copeira",
    pluralLower: "copeiras",
  },
  Porteiro: {
    singularLower: "porteiro",
    pluralLower: "porteiros",
  },
  Segurança: {
    singularLower: "segurança",
    pluralLower: "seguranças",
  },
  Monitor: {
    singularLower: "monitor",
    pluralLower: "monitores",
  },
  Recepcionista: {
    singularLower: "recepcionista",
    pluralLower: "recepcionistas",
  },
};

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function toPtBrNumberWords(value: number): string {
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

  if (value < 10) return units[value];
  if (value < 20) return teens[value - 10];

  const hundred = Math.floor(value / 100);
  const rest = value % 100;

  const toTens = (num: number): string => {
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

function serviceLower(type: BudgetServiceType, quantity: number): string {
  const meta = SERVICE_META[type];
  return quantity === 1 ? meta.singularLower : meta.pluralLower;
}

export function buildBudgetServiceDescription(
  type: BudgetServiceType,
  quantity: number,
): string {
  const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  const quantityWords = toPtBrNumberWords(safeQuantity);
  const lowerService = serviceLower(type, safeQuantity);

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
    const meta = SERVICE_META[option];
    if (
      normalized.includes(normalizeText(meta.singularLower)) ||
      normalized.includes(normalizeText(meta.pluralLower))
    ) {
      return option;
    }
  }

  return "";
}

export function getServiceLabels(type: BudgetServiceType): {
  singular: string;
  plural: string;
} {
  const meta = SERVICE_META[type];
  return { singular: meta.singularLower, plural: meta.pluralLower };
}
