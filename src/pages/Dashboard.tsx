import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, FileSignature, FileText } from "lucide-react";
import StatCard from "../components/molecules/StatCard";
import SectionCard from "../components/organisms/SectionCard";
import { getBudgets } from "../api/budgets/methods";
import { getEvents } from "../api/events/methods";
import { fetchContracts } from "../features/contracts/services/contract.service";
import type { Budget } from "../api/budgets/schema";
import type { Contract } from "../api/contracts/schema";
import type { Event } from "../api/events/schema";
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

interface AttentionData {
  awaitingBudgets: Budget[];
  awaitingBudgetsTotal: number;
  pendingContracts: Contract[];
  pendingContractsTotal: number;
  upcomingEvents: Event[];
  upcomingEventsTotal: number;
}

const EMPTY_DATA: AttentionData = {
  awaitingBudgets: [],
  awaitingBudgetsTotal: 0,
  pendingContracts: [],
  pendingContractsTotal: 0,
  upcomingEvents: [],
  upcomingEventsTotal: 0,
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AttentionData>(EMPTY_DATA);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      const today = new Date();
      const in7Days = addDays(today, 7);

      const [budgetsResult, contractsResult, eventsResult] =
        await Promise.allSettled([
          getBudgets({ page: 1, limit: 100 }),
          fetchContracts({ page: 1, limit: 100 }),
          getEvents({
            startDate: toIsoDate(today),
            endDate: toIsoDate(in7Days),
            limit: 10,
          }),
        ]);

      if (!active) return;

      const allBudgets =
        budgetsResult.status === "fulfilled" ? budgetsResult.value.items : [];
      const allContracts =
        contractsResult.status === "fulfilled"
          ? contractsResult.value.items
          : [];
      const events =
        eventsResult.status === "fulfilled" ? eventsResult.value.items : [];

      // "Aguardando" = já foi enviado ao cliente, mas ainda não virou
      // contrato nem foi encerrado — é o que precisa de um follow-up.
      const awaitingBudgets = allBudgets.filter(
        (budget) => budget.status === "generated" || budget.status === "sent",
      );
      // "Para assinar" = contrato já formalizado, aguardando a assinatura
      // (ou ainda nem foi enviado para assinatura).
      const pendingContracts = allContracts.filter(
        (contract) =>
          contract.status === "generated" ||
          contract.status === "pending_signature",
      );

      setData({
        awaitingBudgets: awaitingBudgets.slice(0, 5),
        awaitingBudgetsTotal: awaitingBudgets.length,
        pendingContracts: pendingContracts.slice(0, 5),
        pendingContractsTotal: pendingContracts.length,
        upcomingEvents: events.slice(0, 5),
        upcomingEventsTotal: events.length,
      });
      setLoading(false);
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const metrics = [
    {
      label: "Orçamentos aguardando",
      value: String(data.awaitingBudgetsTotal),
      sub: "Enviados, sem resposta ainda",
      icon: <FileText size={18} />,
    },
    {
      label: "Contratos para assinar",
      value: String(data.pendingContractsTotal),
      sub: "Gerados ou aguardando assinatura",
      icon: <FileSignature size={18} />,
    },
    {
      label: "Eventos nos próximos 7 dias",
      value: String(data.upcomingEventsTotal),
      sub: "A partir de hoje",
      icon: <CalendarDays size={18} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <StatCard
            key={metric.label}
            icon={metric.icon}
            label={metric.label}
            value={loading ? "…" : metric.value}
            sub={metric.sub}
            color="#C9A227"
          />
        ))}
      </div>

      <SectionCard
        title="Precisa da minha atenção"
        description="Orçamentos aguardando retorno, contratos para assinar e eventos chegando — para não deixar nada parado."
      >
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2"
              style={{ borderColor: "#C9A227", borderTopColor: "transparent" }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
                Orçamentos aguardando
              </p>
              {data.awaitingBudgets.length === 0 ? (
                <p className="text-sm text-[#9a7060]">
                  Nada aguardando retorno agora.
                </p>
              ) : (
                <div className="space-y-2">
                  {data.awaitingBudgets.map((budget) => (
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
                  {data.awaitingBudgetsTotal > data.awaitingBudgets.length ? (
                    <Link
                      to={budgetRoutePaths.list}
                      className="block text-xs font-semibold text-[#7a4430] hover:underline"
                    >
                      Ver todos ({data.awaitingBudgetsTotal})
                    </Link>
                  ) : null}
                </div>
              )}
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
                Contratos para assinar
              </p>
              {data.pendingContracts.length === 0 ? (
                <p className="text-sm text-[#9a7060]">
                  Nenhum contrato pendente agora.
                </p>
              ) : (
                <div className="space-y-2">
                  {data.pendingContracts.map((contract) => (
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
                  {data.pendingContractsTotal > data.pendingContracts.length ? (
                    <Link
                      to={contractRoutePaths.list}
                      className="block text-xs font-semibold text-[#7a4430] hover:underline"
                    >
                      Ver todos ({data.pendingContractsTotal})
                    </Link>
                  ) : null}
                </div>
              )}
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
                Eventos nos próximos 7 dias
              </p>
              {data.upcomingEvents.length === 0 ? (
                <p className="text-sm text-[#9a7060]">
                  Nenhum evento nos próximos 7 dias.
                </p>
              ) : (
                <div className="space-y-2">
                  {data.upcomingEvents.map((event) => (
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
                  {data.upcomingEventsTotal > data.upcomingEvents.length ? (
                    <Link
                      to={eventRoutePaths.list}
                      className="block text-xs font-semibold text-[#7a4430] hover:underline"
                    >
                      Ver todos ({data.upcomingEventsTotal})
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
