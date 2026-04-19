import { executeGraphql } from "../../../../shared/http/graphql-client.js";
import { mapBudgetPreviewInputToGraphql } from "../shared/budget-enum-mapper.js";

export class GenerateBudgetPreviewService {
  async execute(userId, input, context = {}) {
    const mutation = `
      mutation GenerateBudgetPreviewPdf($input: GenerateBudgetPreviewInputDto!) {
        generateBudgetPreviewPdf(input: $input) {
          success
          message
          code
          data {
            fileName
            mimeType
            base64Content
            snapshotHash
          }
        }
      }
    `;

    const data = await executeGraphql({
      query: mutation,
      variables: { input: mapBudgetPreviewInputToGraphql(input) },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return data.generateBudgetPreviewPdf;
  }
}
