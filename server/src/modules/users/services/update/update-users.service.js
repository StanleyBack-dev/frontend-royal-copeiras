import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class UpdateUsersService {
  async updateUser(userId, idUsers, input, context = {}) {
    const mutation = `
      mutation AdminUpdateUserAccess($input: AdminUpdateUserAccessInputDto!) {
        adminUpdateUserAccess(input: $input) {
          success
          message
          code
          data {
            idUsers
            group
            status
            inactivatedAt
            updatedAt
          }
        }
      }
    `;

    const sanitizedInput = {
      ...input,
      idUsers,
    };

    delete sanitizedInput.createdAt;
    delete sanitizedInput.updatedAt;
    delete sanitizedInput.email;
    delete sanitizedInput.username;
    delete sanitizedInput.name;
    delete sanitizedInput.urlAvatar;

    const data = await executeGraphql({
      query: mutation,
      variables: { input: sanitizedInput },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return data.adminUpdateUserAccess;
  }
}
