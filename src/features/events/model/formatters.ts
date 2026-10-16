export function formatCurrencyBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function parseEventDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** "12/10" */
export function formatEventDayShort(value?: string): string {
  const date = parseEventDate(value);
  if (!date) return value ?? "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

/** "sábado, 12/10/2026" */
export function formatEventDayLong(value?: string): string {
  const date = parseEventDate(value);
  if (!date) return value ?? "-";
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
