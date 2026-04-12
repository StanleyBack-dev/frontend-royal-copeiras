export interface Customer {
  idCustomers: string;
  name: string;
  document: string;
  type: "individual" | "company";
  email?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerPayload {
  name: string;
  document: string;
  type: "individual" | "company";
  email?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  isActive?: boolean;
}
