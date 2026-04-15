import { CalendarDays, DollarSign, TrendingUp, Users } from "lucide-react";
import StatCard from "../components/molecules/StatCard";
import SectionCard from "../components/organisms/SectionCard";

export default function Dashboard() {
  const metrics = [
    {
      label: "Clientes ativos",
      value: "148",
      sub: "+12 neste mes",
      icon: <Users size={18} />,
    },
    {
      label: "Eventos confirmados",
      value: "23",
      sub: "8 nesta semana",
      icon: <CalendarDays size={18} />,
    },
    {
      label: "Receita projetada",
      value: "R$ 18.400",
      sub: "Meta mensal em 78%",
      icon: <DollarSign size={18} />,
    },
    {
      label: "Margem operacional",
      value: "26%",
      sub: "+4% sobre o ultimo ciclo",
      icon: <TrendingUp size={18} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatCard
            key={metric.label}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            sub={metric.sub}
            color="#C9A227"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <SectionCard
          title="Agenda prioritaria"
          description="Acompanhe os proximos compromissos com maior impacto operacional."
        >
          <div className="space-y-3">
            {[
              ["Hoje, 14:00", "Reuniao de alinhamento com equipe de eventos"],
              [
                "Amanhã, 09:30",
                "Visita tecnica para novo contrato corporativo",
              ],
              ["Sexta, 16:00", "Revisao financeira do fechamento semanal"],
            ].map(([time, label]) => (
              <div
                key={label}
                className="flex flex-col gap-1 rounded-xl border border-[#e8d5c9] bg-[#faf6f2] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-semibold text-[#7a4430]">
                  {time}
                </span>
                <span className="text-sm text-[#2C1810]">{label}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Resumo operacional"
          description="Indicadores rapidos para acompanhamento diario."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {[
              ["Equipes alocadas", "11"],
              ["Contratos pendentes", "4"],
              ["Cobertura de agenda", "92%"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-[#e8d5c9] px-4 py-4"
              >
                <p className="text-sm text-[#7a4430]">{label}</p>
                <p className="mt-2 text-2xl font-bold text-[#2C1810]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
