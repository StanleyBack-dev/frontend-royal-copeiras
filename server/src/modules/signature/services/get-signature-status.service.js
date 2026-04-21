import { executeGraphql } from "../../../shared/http/graphql-client.js";

export class GetSignatureStatusService {
  async execute(userId, requestId, context = {}) {
    const mutation = `
      mutation GetSignatureStatus($input: GetSignatureStatusInputDto!) {
        getSignatureStatus(input: $input) {
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
      variables: { input: { requestId } },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return data.getSignatureStatus;
  }
}
