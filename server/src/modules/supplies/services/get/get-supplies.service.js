import { executeGraphql } from "../../../../shared/http/graphql-client.js";
import {
  buildCacheKey,
  getOrSetCache,
} from "../../../../shared/cache/in-memory-cache.js";
import { config } from "../../../../config/env.js";

export class GetSuppliesService {
  async findAll(userId, input = {}, context = {}) {
    const query = `
      query GetSupplies($input: GetSuppliesInputDto) {
        getSupplies(input: $input) {
          success
          message
          code
          items {
            idSupplies
            name
            defaultUnit
            suggestedUnitPrice
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

    const cacheKey = buildCacheKey("supplies:list", "global", input);

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

        return data.getSupplies;
      },
      config.listCacheTtlMs,
    );
  }
}
