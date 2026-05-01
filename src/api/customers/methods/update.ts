import type { Customer, UpdateCustomerPayload } from "../schema";
import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";

const API_BASE_URL = "/api/customers";

export async function updateCustomer(
  id: string,
  payload: UpdateCustomerPayload,
): Promise<Customer> {
  const response = await httpClient.put<unknown>(
    `${API_BASE_URL}/${id}`,
    payload,
  );

  return extractMutationData<Customer>(response.data);
}
