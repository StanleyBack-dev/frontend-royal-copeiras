import { executeGraphql } from "../../../shared/http/graphql-client.js";

export class CreateSignatureRequestService {
  async execute(userId, input, context = {}) {
    const mutation = `
      mutation CreateSignatureRequest($input: CreateSignatureRequestInputDto!) {
        createSignatureRequest(input: $input) {
          success
          message
          code
          data {
            requestId
            status
            providerRawStatus
            signatureUrl
            completedAt
          }
        }
      }
    `;

    const data = await executeGraphql({
      query: mutation,
      variables: { input },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return data.createSignatureRequest;
  }
}
