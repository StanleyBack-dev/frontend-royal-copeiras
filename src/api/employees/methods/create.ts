import axios from "axios";
import type { CreateEmployeePayload, Employee } from "../schema";

const API_BASE_URL = "/api/employees";

export async function createEmployee(
  payload: CreateEmployeePayload,
  userId: string,
): Promise<Employee> {
  const response = await axios.post<Employee>(API_BASE_URL, payload, {
    headers: {
      "x-user-id": userId,
    },
  });

  return response.data;
}
