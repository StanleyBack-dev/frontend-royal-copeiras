import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class CreateUsersService {
  async createUser(userId, input, context = {}) {
    const mutation = `
      mutation CreateUser($input: CreateUserInputDto!) {
        createUser(input: $input) {
          success
          message
          code
          data {
            idUsers
            name
            email
            username
            group
            temporaryPassword
            mustChangePassword
            urlAvatar
            status
            createdAt
          }
        }
      }
    `;

    const sanitizedInput = { ...input };

    const data = await executeGraphql({
      query: mutation,
      variables: { input: sanitizedInput },
      userId,
      authorization: context.authorization,
      requestId: context.requestId,
    });

    return data.createUser;
  }
}
