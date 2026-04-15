import { AlertCircle, BadgeDollarSign, CalendarClock } from "lucide-react";
import StatCard from "@/components/molecules/StatCard";
import SectionCard from "@/components/organisms/SectionCard";

export default function Debts() {
  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={<BadgeDollarSign size={18} />}
          label="Contas em aberto"
          value="R$ 9.430"
          sub="Distribuidas em 7 lançamentos"
        />
        <StatCard
          icon={<CalendarClock size={18} />}
          label="Vencimentos da semana"
          value="3"
          sub="Exigem acompanhamento"
        />
        <StatCard
          icon={<AlertCircle size={18} />}
          label="Criticidade"
          value="Baixa"
          sub="Nenhum atraso superior a 15 dias"
        />
      </div>

      <SectionCard
        title="Titulos prioritarios"
        description="Lista condensada com vencimentos mais sensiveis."
      >
        <div className="space-y-3">
          {[
            ["Fornecedor Aurora", "18 Abr", "R$ 2.150"],
            ["Locacao de Equipamentos", "19 Abr", "R$ 1.480"],
            ["Servicos Temporarios", "22 Abr", "R$ 980"],
          ].map(([name, dueDate, amount]) => (
            <div
              key={name}
              className="flex flex-col gap-2 rounded-xl border border-[#e8d5c9] bg-[#faf6f2] px-4 py-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-[#2C1810]">{name}</p>
                <p className="text-sm text-[#7a4430]">Vencimento: {dueDate}</p>
              </div>
              <span className="text-sm font-semibold text-[#7a4430]">
                {amount}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
