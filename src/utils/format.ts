// Formata número de celular brasileiro (ex: (11) 91234-5678)
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

// Formata número de telefone fixo brasileiro (ex: (11) 2345-6789)
export function formatLandline(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
}
// Funções utilitárias para formatação e máscara de CPF/CNPJ

export function formatCPF(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function formatCNPJ(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function formatBrazilianDocument(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.length <= 11) {
    return formatCPF(digits);
  }

  return formatCNPJ(digits);
}

export function formatDate(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (!digits) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function integerToWords(n: number): string {
  if (n === 0) return "zero";
  const units = [
    "",
    "um",
    "dois",
    "três",
    "quatro",
    "cinco",
    "seis",
    "sete",
    "oito",
    "nove",
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
  if (n === 100) return "cem";
  if (n < 20) return units[n];
  if (n < 100) {
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    return unit === 0 ? tens[ten] : `${tens[ten]} e ${units[unit]}`;
  }
  if (n < 1_000) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    return rest === 0
      ? hundreds[h]
      : `${hundreds[h]} e ${integerToWords(rest)}`;
  }
  if (n < 1_000_000) {
    const thousands = Math.floor(n / 1_000);
    const rest = n % 1_000;
    const thousandsWord =
      thousands === 1 ? "mil" : `${integerToWords(thousands)} mil`;
    if (rest === 0) return thousandsWord;
    const connector = rest < 100 || rest % 100 === 0 ? " e " : ", ";
    return `${thousandsWord}${connector}${integerToWords(rest)}`;
  }
  const millions = Math.floor(n / 1_000_000);
  const rest = n % 1_000_000;
  const millionsWord =
    millions === 1 ? "um milhão" : `${integerToWords(millions)} milhões`;
  return rest === 0
    ? millionsWord
    : `${millionsWord} e ${integerToWords(rest)}`;
}

/**
 * Formats a BRL value with its written-out extension in Brazilian Portuguese.
 * Example: 1500 → "R$ 1.500,00 (mil e quinhentos reais)"
 */
export function formatCurrencyExtended(value: number): string {
  const brl = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);

  const rounded = Math.round((value || 0) * 100);
  const reais = Math.floor(rounded / 100);
  const centavos = rounded % 100;

  const reaisWords =
    reais > 0
      ? `${integerToWords(reais)} ${reais === 1 ? "real" : "reais"}`
      : "";
  const centavosWords =
    centavos > 0
      ? `${integerToWords(centavos)} ${centavos === 1 ? "centavo" : "centavos"}`
      : "";

  const extenso =
    [reaisWords, centavosWords].filter(Boolean).join(" e ") || "zero reais";
  return `${brl} (${extenso})`;
}

export function formatDateTimeDisplay(value?: string): string {
  if (!value) return "";

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsedDate);
}

export function onlyDigits(value: string, maxLength?: number): string {
  const digits = value.replace(/\D/g, "");
  return maxLength ? digits.slice(0, maxLength) : digits;
}
