import { executeGraphql } from "../../../../shared/http/graphql-client.js";
import {
  buildCacheKey,
  getOrSetCache,
} from "../../../../shared/cache/in-memory-cache.js";
import { config } from "../../../../config/env.js";

export class GetPaymentsService {
  async findAll(userId, input = {}, context = {}) {
    const query = `
      query GetPayments($input: GetPaymentsInputDto) {
        getPayments(input: $input) {
          success
          message
          code
          items {
            idPayments
            idUsers
            idLeads
            idBudgets
            idContracts
            idEvents
            idEmployees
            origin
            status
            plannedAmount
            paidAmount
            paymentDate
            dueDate
            proofUrl
            notes
            paymentItems {
              idPaymentItems
              idPayments
              origin
              status
              plannedAmount
              paidAmount
              paymentDate
              dueDate
              proofUrl
              notes
              sortOrder
              createdAt
              updatedAt
            }
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

    const cacheKey = buildCacheKey("payments:list:v2", userId, input);

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

        return data.getPayments;
      },
      config.listCacheTtlMs,
    );
  }
}
