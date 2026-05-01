import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class GetUserPagePermissionsService {
  async execute(userId, idUsers, context = {}) {
    const query = `
      query GetUserPagePermissions($input: GetUserPagePermissionsInputDto!) {
        getUserPagePermissions(input: $input) {
          idUsers
          group
          effectivePermissions
          updatedAt
        }
      }
    `;

    const data = await executeGraphql({
      query,
      variables: { input: { idUsers } },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return data.getUserPagePermissions;
  }
}
