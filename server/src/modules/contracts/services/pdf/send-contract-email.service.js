import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class SendContractEmailService {
  async execute(userId, idContracts, context = {}) {
    const mutation = `
      mutation SendContractEmail($input: SendContractEmailInputDto!) {
        sendContractEmail(input: $input) {
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

    return data.sendContractEmail;
  }
}
