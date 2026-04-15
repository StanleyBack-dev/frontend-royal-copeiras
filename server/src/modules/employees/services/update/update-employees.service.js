import axios from "axios";
import { config } from "../../../../config/env.js";

export class UpdateEmployeesService {
  async updateEmployee(userId, idEmployees, input) {
    const mutation = `
      mutation UpdateEmployees($input: UpdateEmployeesInputDto!) {
        updateEmployees(input: $input) {
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

    const sanitizedInput = {
      ...input,
      idEmployees,
    };

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

      return response.data.data.updateEmployees;
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
