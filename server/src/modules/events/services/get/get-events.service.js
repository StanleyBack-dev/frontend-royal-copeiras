import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class GetEventsService {
  async execute(userId, input = {}, context = {}) {
    const query = `
      query GetEvents($input: GetEventsInputDto) {
        getEvents(input: $input) {
          success
          message
          code
          items {
            idEvents
            eventNumber
            idContracts
            idBudgets
            idLeads
            idCustomers
            status
            notes
            contractNumber
            budgetNumber
            customerName
            leadName
            eventDates
            eventLocation
            eventArrivalTimes
            eventDepartureTimes
            eventLocationPerDay
            guestCountPerDay
            durationHoursPerDay
            displacementFee
            discountTotal
            overtimeMinutes
            overtimeAmount
            serviceBreakdown {
              idBudgetItems
              serviceDescription
              quantity
              unitPrice
              totalPrice
              sortOrder
              eventDateIndex
            }
            totalRevenue
            totalCost
            companyReceivable
            createdAt
            updatedAt
            assignments {
              idEventAssignments
              idBudgetItems
              idEmployees
              allocationIndex
              employeePayment
              isActive
              budgetItemDescription
              budgetItemQuantity
              eventDateIndex
              employeeName
              createdAt
              updatedAt
            }
          }
          total
          currentPage
          limit
          totalPages
          hasNextPage
        }
      }
    `;

    const data = await executeGraphql({
      query,
      variables: { input },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return data.getEvents;
  }
}
