import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Calculator,
  FileSignature,
  FileText,
  Percent,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import StatCard from "../components/molecules/StatCard";
import SectionCard from "../components/organisms/SectionCard";
import {
  PeriodFilter,
  PipelineBarChart,
  RevenueTrendChart,
  StatusPieChart,
  TrendBadge,
  useDashboardData,
  type StatusSlice,
} from "../features/dashboard";
import {
  budgetRoutePaths,
  contractRoutePaths,
  eventRoutePaths,
} from "../router";
import { formatDateDisplay } from "../utils/format";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function Spinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2"
        style={{ borderColor: "#C9A227", borderTopColor: "transparent" }}
      />
    </div>
  );
}

function EmptyChartMessage({ message }: { message: string }) {
  return (
    <div className="flex h-64 items-center justify-center text-center text-sm text-[#9a7060]">
      {message}
    </div>
  );
}

export default function Dashboard() {
  const {
    loading,
    range,
    preset,
    setPreset,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    raw,
    financials,
    trends,
    conversionRate,
    averageTicket,
    budgetsCount,
    contractsCount,
    revenueTrend,
    pipelineTrend,
    budgetStatusBreakdown,
    contractStatusBreakdown,
  } = useDashboardData();

  const revenueComposition: StatusSlice[] = useMemo(
    () => [
      { label: "Líquido", value: financials.netRevenue, color: "#059669" },
      {
        label: "Custo com equipe",
        value: financials.staffCost,
        color: "#e11d48",
      },
    ],
    [financials.netRevenue, financials.staffCost],
  );

  const attention = useMemo(() => {
    const today = new Date();
    const in7Days = addDays(today, 7);
    const todayIso = toIsoDate(today);
    const in7DaysIso = toIsoDate(in7Days);

    const awaitingBudgets = raw.budgets.filter(
      (budget) => budget.status === "generated" || budget.status === "sent",
    );
    const pendingContracts = raw.contracts.filter(
      (contract) =>
        contract.status === "generated" ||
        contract.status === "pending_signature",
    );
    const upcomingEvents = raw.events
      .filter((event) => {
        const anchorDate = event.eventDates?.[0];
        return (
          !!anchorDate && anchorDate >= todayIso && anchorDate <= in7DaysIso
        );
      })
      .sort((left, right) =>
        (left.eventDates?.[0] ?? "").localeCompare(right.eventDates?.[0] ?? ""),
      );

    return {
      awaitingBudgets: awaitingBudgets.slice(0, 5),
      awaitingBudgetsTotal: awaitingBudgets.length,
      pendingContracts: pendingContracts.slice(0, 5),
      pendingContractsTotal: pendingContracts.length,
      upcomingEvents: upcomingEvents.slice(0, 5),
      upcomingEventsTotal: upcomingEvents.length,
    };
  }, [raw]);

  const hasRevenueData = revenueTrend.some(
    (point) => point.bruto !== 0 || point.liquido !== 0,
  );
  const hasPipelineData = pipelineTrend.some(
    (point) => point.orcamentos > 0 || point.contratos > 0,
  );

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <PeriodFilter
        preset={preset}
        onPresetChange={setPreset}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onCustomStartDateChange={setCustomStartDate}
        onCustomEndDateChange={setCustomEndDate}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Faturamento bruto"
          value={loading ? "…" : formatCurrency(financials.grossRevenue)}
          sub="Receita total dos eventos do período"
          icon={<TrendingUp size={18} />}
          color="#C9A227"
        >
          {!loading ? <TrendBadge trend={trends.grossRevenue} /> : null}
        </StatCard>
        <StatCard
          label="Custo com equipe"
          value={loading ? "…" : formatCurrency(financials.staffCost)}
          sub="Pago aos funcionários alocados"
          icon={<Users size={18} />}
          color="#e11d48"
        >
          {!loading ? <TrendBadge trend={trends.staffCost} invert /> : null}
        </StatCard>
        <StatCard
          label="Faturamento líquido"
          value={loading ? "…" : formatCurrency(financials.netRevenue)}
          sub="Bruto menos custo com equipe"
          icon={<Wallet size={18} />}
          color="#059669"
        >
          {!loading ? <TrendBadge trend={trends.netRevenue} /> : null}
        </StatCard>
        <StatCard
          label="Ticket médio por evento"
          value={loading ? "…" : formatCurrency(averageTicket)}
          sub="Faturamento bruto ÷ eventos do período"
          icon={<Calculator size={18} />}
          color="#7a4430"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Orçamentos criados"
          value={loading ? "…" : String(budgetsCount)}
          sub="Emitidos no período"
          icon={<FileText size={18} />}
          color="#C9A227"
        >
          {!loading ? <TrendBadge trend={trends.budgetsCount} /> : null}
        </StatCard>
        <StatCard
          label="Contratos criados"
          value={loading ? "…" : String(contractsCount)}
          sub="Gerados no período"
          icon={<FileSignature size={18} />}
          color="#7a4430"
        >
          {!loading ? <TrendBadge trend={trends.contractsCount} /> : null}
        </StatCard>
        <StatCard
          label="Taxa de conversão"
          value={loading ? "…" : `${conversionRate.toFixed(1)}%`}
          sub="Contratos ÷ orçamentos no período"
          icon={<Percent size={18} />}
          color="#a8811a"
        >
          {!loading ? <TrendBadge trend={trends.conversionRate} /> : null}
        </StatCard>
        <StatCard
          label="Eventos no período"
          value={loading ? "…" : String(financials.eventsCount)}
          sub={`De ${formatDateDisplay(range.startDate)} até ${formatDateDisplay(range.endDate)}`}
          icon={<CalendarDays size={18} />}
          color="#C9A227"
        >
          {!loading ? <TrendBadge trend={trends.eventsCount} /> : null}
        </StatCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard
          title="Faturamento ao longo do período"
          description="Bruto vs líquido, agrupado automaticamente por dia, semana ou mês conforme o período."
          className="xl:col-span-2"
        >
          {loading ? (
            <Spinner />
          ) : hasRevenueData ? (
            <RevenueTrendChart data={revenueTrend} />
          ) : (
            <EmptyChartMessage message="Nenhum evento com faturamento no período selecionado." />
          )}
        </SectionCard>

        <SectionCard
          title="Composição do faturamento"
          description="Quanto do valor bruto vira lucro líquido após pagar a equipe."
        >
          {loading ? (
            <Spinner />
          ) : financials.grossRevenue > 0 ? (
            <StatusPieChart
              data={revenueComposition}
              formatValue={formatCurrency}
            />
          ) : (
            <EmptyChartMessage message="Sem faturamento no período selecionado." />
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Orçamentos x Contratos"
        description="Volume de orçamentos criados e contratos gerados por período."
      >
        {loading ? (
          <Spinner />
        ) : hasPipelineData ? (
          <PipelineBarChart data={pipelineTrend} />
        ) : (
          <EmptyChartMessage message="Nenhum orçamento ou contrato no período selecionado." />
        )}
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <SectionCard title="Orçamentos por status">
          {loading ? (
            <Spinner />
          ) : budgetStatusBreakdown.length > 0 ? (
            <StatusPieChart data={budgetStatusBreakdown} />
          ) : (
            <EmptyChartMessage message="Nenhum orçamento no período selecionado." />
          )}
        </SectionCard>

        <SectionCard title="Contratos por status">
          {loading ? (
            <Spinner />
          ) : contractStatusBreakdown.length > 0 ? (
            <StatusPieChart data={contractStatusBreakdown} />
          ) : (
            <EmptyChartMessage message="Nenhum contrato no período selecionado." />
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Precisa da minha atenção"
        description="Orçamentos aguardando retorno, contratos para assinar e eventos chegando — para não deixar nada parado."
      >
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
                Orçamentos aguardando
              </p>
              {attention.awaitingBudgets.length === 0 ? (
                <p className="text-sm text-[#9a7060]">
                  Nada aguardando retorno agora.
                </p>
              ) : (
                <div className="space-y-2">
                  {attention.awaitingBudgets.map((budget) => (
                    <Link
                      key={budget.idBudgets}
                      to={budgetRoutePaths.edit(budget.idBudgets)}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#e8d5c9] bg-[#faf6f2] px-4 py-3 text-sm transition-colors hover:border-[#7a4430]"
                    >
                      <span className="font-semibold text-[#2C1810]">
                        {budget.budgetNumber}
                      </span>
                      <span className="text-[#7a4430]">
                        {formatCurrency(budget.totalAmount)}
                      </span>
                    </Link>
                  ))}
                  {attention.awaitingBudgetsTotal >
                  attention.awaitingBudgets.length ? (
                    <Link
                      to={budgetRoutePaths.list}
                      className="block text-xs font-semibold text-[#7a4430] hover:underline"
                    >
                      Ver todos ({attention.awaitingBudgetsTotal})
                    </Link>
                  ) : null}
                </div>
              )}
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
                Contratos para assinar
              </p>
              {attention.pendingContracts.length === 0 ? (
                <p className="text-sm text-[#9a7060]">
                  Nenhum contrato pendente agora.
                </p>
              ) : (
                <div className="space-y-2">
                  {attention.pendingContracts.map((contract) => (
                    <Link
                      key={contract.idContracts}
                      to={contractRoutePaths.edit(contract.idContracts)}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#e8d5c9] bg-[#faf6f2] px-4 py-3 text-sm transition-colors hover:border-[#7a4430]"
                    >
                      <span className="font-semibold text-[#2C1810]">
                        {contract.contractNumber}
                      </span>
                      <span className="text-[#7a4430]">
                        {contract.budgetNumber}
                      </span>
                    </Link>
                  ))}
                  {attention.pendingContractsTotal >
                  attention.pendingContracts.length ? (
                    <Link
                      to={contractRoutePaths.list}
                      className="block text-xs font-semibold text-[#7a4430] hover:underline"
                    >
                      Ver todos ({attention.pendingContractsTotal})
                    </Link>
                  ) : null}
                </div>
              )}
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
                Eventos nos próximos 7 dias
              </p>
              {attention.upcomingEvents.length === 0 ? (
                <p className="text-sm text-[#9a7060]">
                  Nenhum evento nos próximos 7 dias.
                </p>
              ) : (
                <div className="space-y-2">
                  {attention.upcomingEvents.map((event) => (
                    <Link
                      key={event.idEvents}
                      to={eventRoutePaths.detail(event.idEvents)}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#e8d5c9] bg-[#faf6f2] px-4 py-3 text-sm transition-colors hover:border-[#7a4430]"
                    >
                      <span className="font-semibold text-[#2C1810]">
                        {event.leadName ||
                          event.customerName ||
                          event.eventNumber}
                      </span>
                      <span className="text-[#7a4430]">
                        {event.eventDates?.[0]
                          ? formatDateDisplay(event.eventDates[0])
                          : "-"}
                      </span>
                    </Link>
                  ))}
                  {attention.upcomingEventsTotal >
                  attention.upcomingEvents.length ? (
                    <Link
                      to={eventRoutePaths.list}
                      className="block text-xs font-semibold text-[#7a4430] hover:underline"
                    >
                      Ver todos ({attention.upcomingEventsTotal})
                    </Link>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
