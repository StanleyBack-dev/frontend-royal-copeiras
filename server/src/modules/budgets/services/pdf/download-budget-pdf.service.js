import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class DownloadBudgetPdfService {
  async execute(userId, idBudgets, context = {}) {
    const query = `
      query DownloadBudgetPdf($input: DownloadBudgetPdfInputDto!) {
        downloadBudgetPdf(input: $input) {
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
      query,
      variables: { input: { idBudgets } },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return data.downloadBudgetPdf;
  }
}
