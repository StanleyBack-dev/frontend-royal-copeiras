import StatCard from "../components/molecules/StatCard";

export default function Dashboard() {
  // ...lógica de dados...
  return (
    <>
      {/* Cards de estatísticas, gráficos, etc. */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Exemplo de uso do StatCard */}
        <StatCard
          icon={<span>Icon</span>}
          label="Clientes"
          value="100"
          sub="Total"
          color="#C9A227"
        />
        {/* ...outros StatCards... */}
      </div>
      {/* ...outros conteúdos... */}
    </>
  );
}
