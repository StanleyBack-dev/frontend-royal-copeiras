import { executeGraphql } from "../../../../shared/http/graphql-client.js";
import { invalidateCacheByPrefix } from "../../../../shared/cache/in-memory-cache.js";

export class UpdateEventAssignmentService {
  async execute(userId, input, context = {}) {
    const mutation = `
      mutation UpdateEventAssignment($input: UpdateEventAssignmentInputDto!) {
        updateEventAssignment(input: $input) {
          success
          message
          code
          data {
            idEventAssignments
            idEvents
            idBudgetItems
            idEmployees
            allocationIndex
            employeePayment
            isActive
            employeeName
            budgetItemDescription
            updatedAt
          }
        }
      }
    `;

    const data = await executeGraphql({
      query: mutation,
      variables: { input },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    invalidateCacheByPrefix(`events:list:${userId}:`);

    return data.updateEventAssignment;
  }
}
