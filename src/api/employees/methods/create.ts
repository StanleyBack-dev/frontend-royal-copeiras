import type { CreateEmployeePayload, Employee } from "../schema";
import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";

const API_BASE_URL = "/api/employees";

export async function createEmployee(
  payload: CreateEmployeePayload,
): Promise<Employee> {
  const response = await httpClient.post<unknown>(API_BASE_URL, payload);

  return extractMutationData<Employee>(response.data);
}
