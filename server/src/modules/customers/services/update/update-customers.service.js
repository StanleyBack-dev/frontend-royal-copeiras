import axios from "axios";
import { config } from "../../../../config/env.js";

export class UpdateCustomersService {
  async updateCustomer(userId, idCustomers, input) {
    const mutation = `
      mutation UpdateCustomers($input: UpdateCustomersInputDto!) {
        updateCustomers(input: $input) {
          idCustomers
          name
          document
          type
          email
          phone
          address
          isActive
          createdAt
          updatedAt
        }
      }
    `;

    const sanitizedInput = {
      ...input,
      idCustomers,
    };

    delete sanitizedInput.notes;
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

      return response.data.data.updateCustomers;
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
