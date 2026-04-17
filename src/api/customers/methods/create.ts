import type { CreateCustomerPayload, Customer } from "../schema";
import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";

const API_BASE_URL = "/api/customers";

export async function createCustomer(
  payload: CreateCustomerPayload,
  userId: string,
): Promise<Customer> {
  const response = await httpClient.post<unknown>(API_BASE_URL, payload, {
    headers: {
      "x-user-id": userId,
    },
  });

  return extractMutationData<Customer>(response.data);
}
