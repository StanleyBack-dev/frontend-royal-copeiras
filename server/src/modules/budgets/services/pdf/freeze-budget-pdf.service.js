import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class FreezeBudgetPdfService {
  async execute(userId, idBudgets, context = {}) {
    const mutation = `
      mutation FreezeBudgetPdf($input: FreezeBudgetPdfInputDto!) {
        freezeBudgetPdf(input: $input) {
          success
          message
          code
          data {
            fileName
            mimeType
            base64Content
            snapshotHash
            frozenAt
          }
        }
      }
    `;

    const data = await executeGraphql({
      query: mutation,
      variables: { input: { idBudgets } },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return data.freezeBudgetPdf;
  }
}
