import { executeGraphql } from "../../../shared/http/graphql-client.js";

export class GetSignaturesService {
  async execute(userId, input = {}, context = {}) {
    const query = `
      query GetSignatures($input: GetSignaturesInputDto) {
        getSignatures(input: $input) {
          success
          message
          code
          items {
            idSignatures
            idContracts
            contractNumber
            contractStatus
            provider
            envelopeId
            status
            signedByName
            signedByEmail
            signedByDocument
            signerIp
            signedAt
            signatureUrl
            createdAt
            updatedAt
          }
          total
          currentPage
          limit
          totalPages
          hasNextPage
        }
      }
    `;

    const data = await executeGraphql({
      query,
      variables: { input },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return data.getSignatures;
  }
}
