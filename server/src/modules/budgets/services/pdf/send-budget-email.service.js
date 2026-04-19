import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class SendBudgetEmailService {
  async execute(userId, idBudgets, context = {}) {
    const mutation = `
      mutation SendBudgetEmail($input: SendBudgetEmailInputDto!) {
        sendBudgetEmail(input: $input) {
          success
          message
          code
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

    return data.sendBudgetEmail;
  }
}
