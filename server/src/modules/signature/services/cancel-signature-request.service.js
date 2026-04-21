import { executeGraphql } from "../../../shared/http/graphql-client.js";

export class CancelSignatureRequestService {
  async execute(userId, requestId, context = {}) {
    const mutation = `
      mutation CancelSignatureRequest($input: CancelSignatureRequestInputDto!) {
        cancelSignatureRequest(input: $input) {
          success
          message
          code
        }
      }
    `;

    const data = await executeGraphql({
      query: mutation,
      variables: { input: { requestId } },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return data.cancelSignatureRequest;
  }
}
