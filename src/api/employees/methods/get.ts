import axios from "axios";
import type { Employee } from "../schema";

const API_BASE_URL = "/api/employees";

export async function getEmployees(userId: string): Promise<Employee[]> {
  const response = await axios.get<Employee[]>(API_BASE_URL, {
    headers: {
      "x-user-id": userId,
    },
  });

  return response.data;
}
