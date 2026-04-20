import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class GenerateContractPreviewService {
  async execute(userId, input, context = {}) {
    const mutation = `
      mutation GenerateContractPreviewPdf($input: GenerateContractPreviewInputDto!) {
        generateContractPreviewPdf(input: $input) {
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
      variables: { input },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return data.generateContractPreviewPdf;
  }
}
