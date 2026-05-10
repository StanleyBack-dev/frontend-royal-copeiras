import { onlyDigits } from "@/utils/format";

export function formatCurrencyInput(value: string): string {
  const digits = onlyDigits(value);

  if (!digits) {
    return "";
  }

  const amount = Number(digits) / 100;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export function parseCurrencyInput(value: string): number | undefined {
  const digits = onlyDigits(value);

  if (!digits) {
    return undefined;
  }

  return Number(digits) / 100;
}

export function formatCurrencyFromDecimal(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
