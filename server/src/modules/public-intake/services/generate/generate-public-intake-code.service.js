import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class GeneratePublicIntakeCodeService {
  async generateCode(userId, context = {}) {
    const mutation = `
      mutation GeneratePublicIntakeCode {
        generatePublicIntakeCode {
          success
          message
          code
          data {
            code
            expiresAt
          }
        }
      }
    `;

    const data = await executeGraphql({
      query: mutation,
      variables: {},
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return data.generatePublicIntakeCode;
  }
}
