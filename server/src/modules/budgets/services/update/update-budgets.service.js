import { executeGraphql } from "../../../../shared/http/graphql-client.js";
import {
  mapBudgetInputToGraphql,
  mapBudgetMutationResponseFromGraphql,
} from "../shared/budget-enum-mapper.js";

export class UpdateBudgetsService {
  async updateBudget(userId, idBudgets, input, context = {}) {
    const mutation = `
      mutation UpdateBudgets($input: UpdateBudgetsInputDto!) {
        updateBudgets(input: $input) {
          success
          message
          code
          data {
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
        }
      }
    `;

    const sanitizedInput = {
      ...input,
      idBudgets,
    };

    delete sanitizedInput.createdAt;
    delete sanitizedInput.updatedAt;
    delete sanitizedInput.budgetNumber;
    delete sanitizedInput.subtotal;

    const data = await executeGraphql({
      query: mutation,
      variables: { input: mapBudgetInputToGraphql(sanitizedInput) },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return mapBudgetMutationResponseFromGraphql(data.updateBudgets);
  }
}
