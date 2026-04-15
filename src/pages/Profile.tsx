import SectionCard from "@/components/organisms/SectionCard";

export default function Profile() {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <SectionCard
        title="Dados da empresa"
        description="Informações institucionais organizadas em blocos simples para leitura rápida."
      >
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            ["Razão social", "Royal Copeiras e Eventos"],
            ["CNPJ", "12.345.678/0001-90"],
            ["Telefone", "(11) 4000-1234"],
            ["E-mail", "contato@royalcopeiras.com.br"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-[#e8d5c9] px-4 py-4"
            >
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
                {label}
              </dt>
              <dd className="mt-2 text-sm text-[#2C1810]">{value}</dd>
            </div>
          ))}
        </dl>
      </SectionCard>

      <SectionCard
        title="Observações operacionais"
        description="Resumo de posicionamento e próximos passos internos."
      >
        <div className="space-y-3 text-sm leading-6 text-[#2C1810]">
          <p>
            Estrutura pronta para atendimento corporativo e social, com equipes
            móveis e agenda centralizada.
          </p>
          <p>
            Prioridade atual: consolidar indicadores, histórico de clientes e
            rotinas financeiras em um fluxo único.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
