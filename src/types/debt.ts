export interface Debt {
  id: string;
  description: string;
  party_name: string;
  amount: number;
  due_date: string | null;
  status: 'Pendente' | 'Pago' | 'Vencido' | 'Negociando';
  type: 'payable' | 'receivable';
  notes: string;
  created_at: string;
}
