import axios from "axios";
import { config } from "../../../../config/env.js";

export class CreateEmployeesService {
  async createEmployee(userId, input) {
    const mutation = `
      mutation CreateEmployees($input: CreateEmployeesInputDto!) {
        createEmployees(input: $input) {
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
    const sanitizedInput = { ...input };
    delete sanitizedInput.createdAt;
    delete sanitizedInput.updatedAt;
    const variables = { input: sanitizedInput };
    const headers = {
      "x-user-id": userId,
      Authorization: `Bearer ${userId}`,
    };

    try {
      const response = await axios.post(
        config.backendGraphqlUrl,
        { query: mutation, variables },
        { headers },
      );

      return response.data.data.createEmployees;
    } catch (error) {
      if (error.response) {
        console.error(
          "GraphQL error:",
          error.response.status,
          error.response.data,
        );
      } else {
        console.error("GraphQL error:", error.message);
      }

      throw error;
    }
  }
}
