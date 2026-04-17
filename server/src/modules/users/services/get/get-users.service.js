import { executeGraphql } from "../../../../shared/http/graphql-client.js";
import {
  buildCacheKey,
  getOrSetCache,
} from "../../../../shared/cache/in-memory-cache.js";
import { config } from "../../../../config/env.js";

export class GetUsersService {
  async findAll(userId, input = {}, context = {}) {
    const query = `
      query GetUsers($input: GetUsersInputDto) {
        getUsers(input: $input) {
          success
          message
          code
          items {
            idUsers
            name
            email
            username
            urlAvatar
            status
            group
            inactivatedAt
            mustChangePassword
            lastLoginAt
            failedLoginAttempts
            lockedUntil
            createdAt
            updatedAt
          }
          total
          currentPage
          limit
          totalPages
          hasNextPage
        }
      }
    `;

    const cacheKey = buildCacheKey("users:list", userId, input);

    return getOrSetCache(
      cacheKey,
      async () => {
        const data = await executeGraphql({
          query,
          variables: { input },
          userId,
          authorization: context.authorization,
          requestId: context.requestId,
        });

        return data.getUsers;
      },
      config.listCacheTtlMs,
    );
  }
}