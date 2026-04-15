import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
import StatCard from "@/components/molecules/StatCard";
import SectionCard from "@/components/organisms/SectionCard";

export default function Finance() {
  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={<Wallet size={18} />}
          label="Saldo operacional"
          value="R$ 42.600"
          sub="Atualizado hoje"
        />
        <StatCard
          icon={<ArrowUpCircle size={18} />}
          label="Entradas previstas"
          value="R$ 14.200"
          sub="Próximos 7 dias"
        />
        <StatCard
          icon={<ArrowDownCircle size={18} />}
          label="Saídas previstas"
          value="R$ 8.950"
          sub="Compromissos confirmados"
        />
      </div>

      <SectionCard
        title="Fluxo de caixa resumido"
        description="Visão sintetica para analise rapida em desktop e mobile."
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {[
            ["Recebimentos em aberto", "R$ 6.300"],
            ["Pagamentos agendados", "R$ 3.480"],
            ["Custo medio por evento", "R$ 1.250"],
            ["Reserva operacional", "R$ 12.000"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-[#e8d5c9] px-4 py-4"
            >
              <p className="text-sm text-[#7a4430]">{label}</p>
              <p className="mt-2 text-xl font-bold text-[#2C1810]">{value}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
