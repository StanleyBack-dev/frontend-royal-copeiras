import { CalendarCheck, Clock3, MapPin } from "lucide-react";
import SectionCard from "@/components/organisms/SectionCard";
import StatCard from "@/components/molecules/StatCard";

export default function Events() {
  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={<CalendarCheck size={18} />}
          label="Eventos da semana"
          value="12"
          sub="3 com prioridade alta"
        />
        <StatCard
          icon={<Clock3 size={18} />}
          label="Em preparação"
          value="5"
          sub="Checklist em andamento"
        />
        <StatCard
          icon={<MapPin size={18} />}
          label="Locais confirmados"
          value="8"
          sub="Cobertura total validada"
        />
      </div>

      <SectionCard
        title="Proximos eventos"
        description="Agenda resumida para acompanhamento rapido em qualquer tamanho de tela."
      >
        <div className="space-y-3">
          {[
            ["16 Abr", "Evento Corporativo Premium", "Hotel Imperial"],
            ["18 Abr", "Cafe de Negocios", "Espaco Aurora"],
            ["21 Abr", "Recepcao Executiva", "Sede Cliente Prime"],
          ].map(([date, title, location]) => (
            <div
              key={title}
              className="flex flex-col gap-2 rounded-xl border border-[#e8d5c9] bg-[#faf6f2] px-4 py-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-[#2C1810]">{title}</p>
                <p className="text-sm text-[#7a4430]">{location}</p>
              </div>
              <span className="text-sm font-medium text-[#7a4430]">{date}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
