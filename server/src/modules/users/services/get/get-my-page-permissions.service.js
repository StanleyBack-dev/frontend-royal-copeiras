import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class GetMyPagePermissionsService {
  async execute(userId, context = {}) {
    const query = `
      query GetMyPagePermissions {
        getMyPagePermissions {
          idUsers
          group
          effectivePermissions
          defaultPermissions
          useGroupDefaults
          updatedAt
        }
      }
    `;

    const data = await executeGraphql({
      query,
      variables: {},
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return data.getMyPagePermissions;
  }
}
