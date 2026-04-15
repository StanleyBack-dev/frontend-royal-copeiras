import { LineChart, ShieldCheck, Sparkles } from "lucide-react";
import StatCard from "@/components/molecules/StatCard";
import SectionCard from "@/components/organisms/SectionCard";

export default function Investments() {
  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={<LineChart size={18} />}
          label="Capital alocado"
          value="R$ 27.500"
          sub="Carteira operacional"
        />
        <StatCard
          icon={<ShieldCheck size={18} />}
          label="Reserva protegida"
          value="R$ 11.000"
          sub="Liquidez imediata"
        />
        <StatCard
          icon={<Sparkles size={18} />}
          label="Retorno medio"
          value="9,4%"
          sub="Ultimos 12 meses"
        />
      </div>

      <SectionCard
        title="Alocação sugerida"
        description="Distribuição resumida para orientar a leitura em telas pequenas e grandes."
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            ["Reserva imediata", "40%"],
            ["Expansao operacional", "35%"],
            ["Projetos estratégicos", "25%"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-[#e8d5c9] px-4 py-5 text-center"
            >
              <p className="text-sm text-[#7a4430]">{label}</p>
              <p className="mt-2 text-2xl font-bold text-[#2C1810]">{value}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
