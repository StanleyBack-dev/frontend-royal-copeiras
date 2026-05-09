import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class CreatePositionsService {
  async createPosition(userId, input, context = {}) {
    const mutation = `
      mutation CreatePositions($input: CreatePositionsInputDto!) {
        createPositions(input: $input) {
          success
          message
          code
          data {
            idPositions
            name
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

    return data.createPositions;
  }
}
