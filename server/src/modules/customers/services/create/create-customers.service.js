import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class CreateCustomersService {
  async createCustomer(userId, input, context = {}) {
    const mutation = `
      mutation CreateCustomers($input: CreateCustomersInputDto!) {
        createCustomers(input: $input) {
          success
          message
          code
          data {
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
      }
    `;

    const sanitizedInput = { ...input };
    delete sanitizedInput.notes;

    const data = await executeGraphql({
      query: mutation,
      variables: { input: sanitizedInput },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return data.createCustomers;
  }
}
