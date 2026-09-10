import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class CreateSuppliesService {
  async createSupply(userId, input, context = {}) {
    const mutation = `
      mutation CreateSupplies($input: CreateSuppliesInputDto!) {
        createSupplies(input: $input) {
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

    const sanitizedInput = { ...input };
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

    return data.createSupplies;
  }
}
