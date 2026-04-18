import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class UnlockUserCredentialService {
  async unlockUser(userId, idUsers, context = {}) {
    const mutation = `
      mutation UnlockUserCredential($input: UnlockUserCredentialInputDto!) {
        unlockUserCredential(input: $input) {
          success
          message
          code
          data {
            idUsers
            updatedAt
          }
        }
      }
    `;

    const data = await executeGraphql({
      query: mutation,
      variables: { input: { idUsers } },
      userId,
      authorization: context.authorization,
      requestId: context.requestId,
    });

    return data.unlockUserCredential;
  }
}
