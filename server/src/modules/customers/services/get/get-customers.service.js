import { executeGraphql } from "../../../../shared/http/graphql-client.js";
import {
  buildCacheKey,
  getOrSetCache,
} from "../../../../shared/cache/in-memory-cache.js";
import { config } from "../../../../config/env.js";

export class GetCustomersService {
  async findAll(userId, input = {}, context = {}) {
    const query = `
      query GetCustomers($input: GetCustomersInputDto) {
        getCustomers(input: $input) {
          success
          message
          code
          items {
            idCustomers
            name
            document
            type
            email
            phone
            address
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

    const cacheKey = buildCacheKey("customers:list", userId, input);

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

        return data.getCustomers;
      },
      config.listCacheTtlMs,
    );
  }
}
