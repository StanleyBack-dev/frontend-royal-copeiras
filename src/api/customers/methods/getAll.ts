import type { Customer } from "../schema";
import { httpClient } from "../../shared/httpClient";
import { normalizeListResponse } from "../../shared/normalizers";

const API_BASE_URL = "/api/customers";

export async function getAllCustomers(userId: string): Promise<Customer[]> {
  const response = await httpClient.get<unknown>(API_BASE_URL, {
    headers: {
      "x-user-id": userId,
    },
  });

  return normalizeListResponse<Customer>(response.data).items;
}
