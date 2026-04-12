export interface Investment {
  id: string;
  name: string;
  category:
    | "Equipamentos"
    | "Marketing"
    | "Treinamento"
    | "Tecnologia"
    | "Infraestrutura"
    | "Outro";
  amount_invested: number;
  current_value: number;
  start_date: string;
  expected_return: number;
  status: "Ativo" | "Concluído" | "Cancelado";
  notes: string;
  created_at: string;
}
