import axios from "axios";
import type { Employee, UpdateEmployeePayload } from "../schema";

const API_BASE_URL = "/api/employees";

export async function updateEmployee(
  id: string,
  payload: UpdateEmployeePayload,
  userId: string,
): Promise<Employee> {
  const response = await axios.put<Employee>(`${API_BASE_URL}/${id}`, payload, {
    headers: {
      "x-user-id": userId,
    },
  });

  return response.data;
}
