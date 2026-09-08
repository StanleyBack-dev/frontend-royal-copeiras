import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class GetPublicIntakeCodesService {
  async getCodes(userId, input, context = {}) {
    const query = `
      query GetPublicIntakeCodes($input: GetPublicIntakeCodesInputDto) {
        getPublicIntakeCodes(input: $input) {
          success
          message
          code
          items {
            idPublicIntakeCodes
            code
            status
            expiresAt
            resultingLeadId
            resultingBudgetId
            createdAt
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

    const result = data.getPublicIntakeCodes;

    // GraphQL serializes enums by their key (e.g. "PENDING"), but the app's
    // status options are lowercase throughout.
    return {
      ...result,
      items: (result.items || []).map((item) => ({
        ...item,
        status:
          typeof item.status === "string"
            ? item.status.toLowerCase()
            : item.status,
      })),
    };
  }
}
