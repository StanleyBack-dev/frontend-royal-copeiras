import type { ReactNode } from "react";
import { eventUiCopy } from "../model/messages";
import { formatCurrencyBRL } from "../model/formatters";

export interface EventFinancialTotals {
  servicesRevenue: number;
  overtimeRevenue: number;
  totalRevenue: number;
  teamCost: number;
  overtimeCost: number;
  extraExpenses: number;
  totalCost: number;
  companyReceivable: number;
}

interface EventFinancialSummaryProps {
  totals: EventFinancialTotals;
  overtimeLabel?: string;
  footer?: ReactNode;
}

const copy = eventUiCopy.detail.summary;

function SummaryRow({
  label,
  value,
  sign,
  strong = false,
}: {
  label: string;
  value: number;
  sign?: "+" | "-";
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-3 text-sm ${strong ? "font-semibold text-[#2c1810]" : "text-[#7a4430]"}`}
    >
      <span className="min-w-0">{label}</span>
      <span className="shrink-0 tabular-nums">
        {sign && value > 0 ? `${sign} ` : ""}
        {formatCurrencyBRL(value)}
      </span>
    </div>
  );
}

export default function EventFinancialSummary({
  totals,
  overtimeLabel,
  footer,
}: EventFinancialSummaryProps) {
  const isPositive = totals.companyReceivable >= 0;
  const marginPercent =
    totals.totalRevenue > 0
      ? Math.round((totals.companyReceivable / totals.totalRevenue) * 100)
      : 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e8d5c9] bg-white shadow-sm">
      <div
        className={`px-5 py-5 ${isPositive ? "bg-gradient-to-br from-[#2c1810] to-[#5a3322]" : "bg-gradient-to-br from-red-900 to-red-700"}`}
      >
        <p className="text-xs font-medium uppercase tracking-wider text-white/70">
          {copy.receivable}
        </p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-white">
          {formatCurrencyBRL(totals.companyReceivable)}
        </p>
        <p className="mt-1 text-xs text-white/70">
          {copy.marginOfRevenue.replace("{percent}", String(marginPercent))}
        </p>
      </div>

      <div className="space-y-4 px-5 py-4">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a16207]">
            {copy.revenueGroup}
          </p>
          <SummaryRow
            label={copy.servicesRevenue}
            value={totals.servicesRevenue}
          />
          <SummaryRow
            label={
              overtimeLabel
                ? `${copy.overtimeRevenue} (${overtimeLabel})`
                : copy.overtimeRevenue
            }
            value={totals.overtimeRevenue}
            sign="+"
          />
          <div className="border-t border-dashed border-[#e8d5c9] pt-2">
            <SummaryRow
              label={copy.totalRevenue}
              value={totals.totalRevenue}
              strong
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-red-700">
            {copy.costGroup}
          </p>
          <SummaryRow label={copy.teamCost} value={totals.teamCost} sign="-" />
          <SummaryRow
            label={copy.overtimeCost}
            value={totals.overtimeCost}
            sign="-"
          />
          <SummaryRow
            label={copy.extraExpenses}
            value={totals.extraExpenses}
            sign="-"
          />
          <div className="border-t border-dashed border-[#e8d5c9] pt-2">
            <SummaryRow
              label={copy.totalCost}
              value={totals.totalCost}
              strong
            />
          </div>
        </div>
      </div>

      {footer ? (
        <div className="border-t border-[#f1e6de] bg-[#fcf9f6] px-5 py-4">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
