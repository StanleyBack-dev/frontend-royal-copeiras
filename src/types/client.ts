export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  document: string | null;
  type: "PF" | "PJ";
  notes: string;
  created_at: string;
}

export interface ICustomer {
  idCustomers: string;
  name: string;
  document: string;
  type: "individual" | "company";
  email?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  isActive: boolean;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
