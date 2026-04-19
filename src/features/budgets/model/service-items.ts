export const budgetServiceTypeOptions = [
  "Garçom",
  "Copeira",
  "Porteiro",
  "Segurança",
] as const;

export type BudgetServiceType = (typeof budgetServiceTypeOptions)[number];

interface ServiceMeta {
  singularLower: string;
  pluralLower: string;
  singularLabel: string;
  pluralLabel: string;
}

const SERVICE_META: Record<BudgetServiceType, ServiceMeta> = {
  Garçom: {
    singularLower: "garçom",
    pluralLower: "garçons",
    singularLabel: "Garçom",
    pluralLabel: "Garçons",
  },
  Copeira: {
    singularLower: "copeira",
    pluralLower: "copeiras",
    singularLabel: "Copeira",
    pluralLabel: "Copeiras",
  },
  Porteiro: {
    singularLower: "porteiro",
    pluralLower: "porteiros",
    singularLabel: "Porteiro",
    pluralLabel: "Porteiros",
  },
  Segurança: {
    singularLower: "segurança",
    pluralLower: "seguranças",
    singularLabel: "Segurança",
    pluralLabel: "Seguranças",
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

function serviceLabel(type: BudgetServiceType, quantity: number): string {
  const meta = SERVICE_META[type];
  return quantity === 1 ? meta.singularLabel : meta.pluralLabel;
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
  const labelService = serviceLabel(type, safeQuantity);

  return [
    `Prestação de serviço de ${safeQuantity} (${quantityWords}) ${lowerService}`,
    "para atuação durante o evento, com foco na",
    "execução do serviço contratado.",
    "",
    `. ${safeQuantity} ${labelService} para o evento`,
  ].join("\n");
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
