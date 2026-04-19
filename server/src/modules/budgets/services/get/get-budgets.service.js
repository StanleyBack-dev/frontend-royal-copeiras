import { executeGraphql } from "../../../../shared/http/graphql-client.js";
import {
  buildCacheKey,
  getOrSetCache,
} from "../../../../shared/cache/in-memory-cache.js";
import { config } from "../../../../config/env.js";
import {
  mapBudgetInputToGraphql,
  mapBudgetListResponseFromGraphql,
} from "../shared/budget-enum-mapper.js";

export class GetBudgetsService {
  async findAll(userId, input = {}, context = {}) {
    const query = `
      query GetBudgets($input: GetBudgetsInputDto) {
        getBudgets(input: $input) {
          success
          message
          code
          items {
            idBudgets
            idLeads
            budgetNumber
            status
            issueDate
            validUntil
            eventDates
            eventLocation
            guestCount
            durationHours
            paymentMethod
            advancePercentage
            subtotal
            totalAmount
            sentVia
            sentAt
            items {
              idBudgetItems
              description
              quantity
              unitPrice
              totalPrice
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

    const mappedInput = mapBudgetInputToGraphql(input);
    const cacheKey = buildCacheKey("budgets:list", userId, mappedInput);

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

        return mapBudgetListResponseFromGraphql(data.getBudgets);
      },
      config.listCacheTtlMs,
    );
  }
}
