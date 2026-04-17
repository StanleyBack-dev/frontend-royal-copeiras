import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class UpdateCustomersService {
  async updateCustomer(userId, idCustomers, input, context = {}) {
    const mutation = `
      mutation UpdateCustomers($input: UpdateCustomersInputDto!) {
        updateCustomers(input: $input) {
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

    const sanitizedInput = {
      ...input,
      idCustomers,
    };

    delete sanitizedInput.notes;
    delete sanitizedInput.createdAt;
    delete sanitizedInput.updatedAt;

    const data = await executeGraphql({
      query: mutation,
      variables: { input: sanitizedInput },
      userId,
      authorization: context.authorization,
      requestId: context.requestId,
    });

    return data.updateCustomers;
  }
}
