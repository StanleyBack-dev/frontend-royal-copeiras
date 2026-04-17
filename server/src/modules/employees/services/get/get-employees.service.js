import { executeGraphql } from "../../../../shared/http/graphql-client.js";
import {
  buildCacheKey,
  getOrSetCache,
} from "../../../../shared/cache/in-memory-cache.js";
import { config } from "../../../../config/env.js";

export class GetEmployeesService {
  async findAll(userId, input = {}, context = {}) {
    const query = `
      query GetEmployees($input: GetEmployeesInputDto) {
        getEmployees(input: $input) {
          success
          message
          code
          items {
            idEmployees
            name
            document
            email
            phone
            position
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

    const cacheKey = buildCacheKey("employees:list", userId, input);

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

        return data.getEmployees;
      },
      config.listCacheTtlMs,
    );
  }
}
