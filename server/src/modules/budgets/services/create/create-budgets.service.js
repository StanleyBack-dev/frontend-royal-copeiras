import { executeGraphql } from "../../../../shared/http/graphql-client.js";
import {
  mapBudgetInputToGraphql,
  mapBudgetMutationResponseFromGraphql,
} from "../shared/budget-enum-mapper.js";

export class CreateBudgetsService {
  async createBudget(userId, input, context = {}) {
    const mutation = `
      mutation CreateBudgets($input: CreateBudgetsInputDto!) {
        createBudgets(input: $input) {
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
            displacementFee
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

    const data = await executeGraphql({
      query: mutation,
      variables: { input: mapBudgetInputToGraphql(input) },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return mapBudgetMutationResponseFromGraphql(data.createBudgets);
  }
}
