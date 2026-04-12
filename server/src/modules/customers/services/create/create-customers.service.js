import axios from "axios";
import { config } from "../../../../config/env.js";

export class CreateCustomersService {
  async createCustomer(userId, input) {
    const mutation = `
      mutation CreateCustomers($input: CreateCustomersInputDto!) {
        createCustomers(input: $input) {
          idCustomers
          name
          document
          type
          email
          phone
          birthDate
          address
          isActive
          createdAt
          updatedAt
        }
      }
    `;
    // Remove campos não suportados pelo backend
    const sanitizedInput = { ...input };
    delete sanitizedInput.notes;
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
      console.log("GraphQL response:", JSON.stringify(response.data, null, 2));
      return response.data.data.createCustomers;
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
