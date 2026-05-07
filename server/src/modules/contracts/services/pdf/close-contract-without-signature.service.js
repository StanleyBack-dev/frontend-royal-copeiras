import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class CloseContractWithoutSignatureService {
  async execute(userId, idContracts, context = {}) {
    const mutation = `
      mutation CloseContractWithoutSignature($input: CloseContractWithoutSignatureInputDto!) {
        closeContractWithoutSignature(input: $input) {
          success
          message
          code
        }
      }
    `;

    const data = await executeGraphql({
      query: mutation,
      variables: { input: { idContracts } },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return data.closeContractWithoutSignature;
  }
}
