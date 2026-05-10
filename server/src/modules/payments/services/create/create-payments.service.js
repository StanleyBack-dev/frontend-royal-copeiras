import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class CreatePaymentsService {
  async createPayment(userId, input, context = {}) {
    const mutation = `
      mutation CreatePayment($input: CreatePaymentInputDto!) {
        createPayment(input: $input) {
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

    return data.createPayment;
  }
}
