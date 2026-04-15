import axios from "axios";
import { config } from "../../../../config/env.js";

export class GetEmployeesService {
  async findAll(userId, input = {}) {
    const query = `
      query GetEmployees($input: GetEmployeesInputDto) {
        getEmployees(input: $input) {
          idEmployees
          name
          document
          email
          phone
          position
          isActive
          createdAt
          updatedAt
        }
      }
    `;
    const variables = { input };
    const headers = {
      "x-user-id": userId,
      Authorization: `Bearer ${userId}`,
    };
    const response = await axios.post(
      config.backendGraphqlUrl,
      { query, variables },
      { headers },
    );

    return response.data.data.getEmployees;
  }
}
