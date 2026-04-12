import axios from "axios";
import type { Customer } from "../types";

const API_BASE_URL = "/api/customers";

export async function updateCustomer(
  id: string,
  payload: Partial<Customer>,
  userId: string,
): Promise<Customer> {
  const response = await axios.put(`${API_BASE_URL}/${id}`, payload, {
    headers: {
      "x-user-id": userId,
    },
  });
  return response.data;
}
