import { executeGraphql } from "../../../../shared/http/graphql-client.js";
import {
  buildCacheKey,
  getOrSetCache,
} from "../../../../shared/cache/in-memory-cache.js";
import { config } from "../../../../config/env.js";
import {
  mapLeadInputToGraphql,
  mapLeadListResponseFromGraphql,
} from "../shared/lead-enum-mapper.js";

export class GetLeadsService {
  async findAll(userId, input = {}, context = {}) {
    const query = `
      query GetLeads($input: GetLeadsInputDto) {
        getLeads(input: $input) {
          success
          message
          code
          items {
            idLeads
            name
            email
            phone
            document
            source
            notes
            status
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

    const mappedInput = mapLeadInputToGraphql(input);
    const cacheKey = buildCacheKey("leads:list", userId, mappedInput);

    return getOrSetCache(
      cacheKey,
      async () => {
        const data = await executeGraphql({
          query,
          variables: { input: mappedInput },
          userId,
          authorization: context.authorization,
          cookieHeader: context.cookieHeader,
          requestId: context.requestId,
        });

        return mapLeadListResponseFromGraphql(data.getLeads);
      },
      config.listCacheTtlMs,
    );
  }
}
