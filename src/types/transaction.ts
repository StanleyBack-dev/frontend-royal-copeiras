export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  event_id: string | null;
  created_at: string;
}
