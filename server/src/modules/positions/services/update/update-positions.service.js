import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class UpdatePositionsService {
  async updatePosition(userId, idPositions, input, context = {}) {
    const mutation = `
      mutation UpdatePositions($input: UpdatePositionsInputDto!) {
        updatePositions(input: $input) {
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

    const sanitizedInput = {
      ...input,
      idPositions,
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

    return data.updatePositions;
  }
}
