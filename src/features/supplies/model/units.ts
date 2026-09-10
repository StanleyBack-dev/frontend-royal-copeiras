// Standard units of measure offered when registering a material. Stored in
// `tb_supplies.default_unit` (varchar 32) as the `value`. Seed data already uses
// the lowercase full-word form ("rolo", "pacote", "unidade"), so keep that shape.
export const SUPPLY_UNIT_OPTIONS = [
  { value: "unidade", label: "Unidade (un)" },
  { value: "caixa", label: "Caixa (cx)" },
  { value: "pacote", label: "Pacote (pct)" },
  { value: "fardo", label: "Fardo" },
  { value: "rolo", label: "Rolo" },
  { value: "saco", label: "Saco" },
  { value: "sache", label: "Sachê" },
  { value: "kg", label: "Quilograma (kg)" },
  { value: "g", label: "Grama (g)" },
  { value: "litro", label: "Litro (L)" },
  { value: "ml", label: "Mililitro (mL)" },
  { value: "metro", label: "Metro (m)" },
  { value: "cm", label: "Centímetro (cm)" },
  { value: "par", label: "Par" },
  { value: "duzia", label: "Dúzia" },
  { value: "cento", label: "Cento" },
  { value: "milheiro", label: "Milheiro" },
  { value: "galao", label: "Galão" },
  { value: "balde", label: "Balde" },
  { value: "tambor", label: "Tambor" },
  { value: "bombona", label: "Bombona" },
  { value: "frasco", label: "Frasco" },
  { value: "tubo", label: "Tubo" },
  { value: "lata", label: "Lata" },
  { value: "barra", label: "Barra" },
  { value: "resma", label: "Resma" },
  { value: "bloco", label: "Bloco" },
  { value: "jogo", label: "Jogo" },
  { value: "kit", label: "Kit" },
  { value: "cartela", label: "Cartela" },
  { value: "ampola", label: "Ampola" },
  { value: "envelope", label: "Envelope" },
  { value: "bisnaga", label: "Bisnaga" },
] as const;

export type SupplyUnitValue = (typeof SUPPLY_UNIT_OPTIONS)[number]["value"];

const SUPPLY_UNIT_LABELS = new Map<string, string>(
  SUPPLY_UNIT_OPTIONS.map((option) => [option.value, option.label]),
);

// Human-friendly label for a stored unit; unknown/legacy values pass through.
export function formatSupplyUnit(unit?: string | null): string {
  const trimmed = (unit ?? "").trim();
  if (!trimmed) {
    return "";
  }
  return SUPPLY_UNIT_LABELS.get(trimmed) ?? trimmed;
}

const FEMININE_SUPPLY_UNITS = new Set([
  "unidade",
  "caixa",
  "dúzia",
  "duzia",
  "resma",
  "cartela",
  "ampola",
  "barra",
  "lata",
  "bombona",
  "bisnaga",
  "sacola",
]);

export function isFeminineSupplyUnit(unit?: string | null): boolean {
  return FEMININE_SUPPLY_UNITS.has((unit ?? "").trim().toLowerCase());
}

/**
 * Best-effort pluralization of a unit of measure for contract wording
 * ("2 rolos", "3 caixas", "5 litros"). Abbreviations (kg, ml, un…) are kept.
 */
export function pluralizeSupplyUnit(unit: string, quantity: number): string {
  const trimmed = unit.trim();
  if (!trimmed || quantity <= 1) {
    return trimmed;
  }

  const lower = trimmed.toLowerCase();
  const irregular: Record<string, string> = {
    par: "pares",
    galão: "galões",
    galao: "galões",
    sachê: "sachês",
    sache: "sachês",
    cartão: "cartões",
  };
  if (irregular[lower]) {
    return irregular[lower];
  }
  if (/^(kg|g|mg|ml|l|cm|m|un|pct|cx)$/i.test(trimmed)) {
    return trimmed;
  }
  if (/ão$/i.test(trimmed)) {
    return trimmed.replace(/ão$/i, "ões");
  }
  if (/[rsz]$/i.test(trimmed)) {
    return `${trimmed}es`;
  }
  if (/l$/i.test(trimmed)) {
    return `${trimmed.slice(0, -1)}is`;
  }
  return `${trimmed}s`;
}
