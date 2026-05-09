import { executeGraphql } from "../../../../shared/http/graphql-client.js";
import {
  buildCacheKey,
  getOrSetCache,
} from "../../../../shared/cache/in-memory-cache.js";
import { config } from "../../../../config/env.js";

export class GetPositionsService {
  async findAll(userId, input = {}, context = {}) {
    const query = `
      query GetPositions($input: GetPositionsInputDto) {
        getPositions(input: $input) {
          success
          message
          code
          items {
            idPositions
            name
            isActive
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

    const cacheKey = buildCacheKey("positions:list", "global", input);

    return getOrSetCache(
      cacheKey,
      async () => {
        const data = await executeGraphql({
          query,
          variables: { input },
          userId,
          authorization: context.authorization,
          cookieHeader: context.cookieHeader,
          requestId: context.requestId,
        });

        return data.getPositions;
      },
      config.listCacheTtlMs,
    );
  }
}
