import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class UpdateSuppliesService {
  async updateSupply(userId, idSupplies, input, context = {}) {
    const mutation = `
      mutation UpdateSupplies($input: UpdateSuppliesInputDto!) {
        updateSupplies(input: $input) {
          success
          message
          code
          data {
            idSupplies
            name
            defaultUnit
            suggestedUnitPrice
            isActive
            createdAt
            updatedAt
          }
        }
      }
    `;

    const sanitizedInput = {
      ...input,
      idSupplies,
    };

    delete sanitizedInput.createdAt;
    delete sanitizedInput.updatedAt;

    const data = await executeGraphql({
      query: mutation,
      variables: { input: sanitizedInput },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return data.updateSupplies;
  }
}
