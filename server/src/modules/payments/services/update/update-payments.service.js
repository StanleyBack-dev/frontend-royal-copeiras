import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class UpdatePaymentsService {
  async updatePayment(userId, idPayments, input, context = {}) {
    const mutation = `
      mutation UpdatePayment($input: UpdatePaymentInputDto!) {
        updatePayment(input: $input) {
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

    const sanitizedInput = {
      ...input,
      idPayments,
    };

    delete sanitizedInput.idUsers;
    delete sanitizedInput.idLeads;
    delete sanitizedInput.idBudgets;
    delete sanitizedInput.idContracts;
    delete sanitizedInput.idEmployees;
    delete sanitizedInput.origin;
    delete sanitizedInput.plannedAmount;
    delete sanitizedInput.createdAt;
    delete sanitizedInput.updatedAt;

    const data = await executeGraphql({
      query: mutation,
      variables: { input: sanitizedInput },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return data.updatePayment;
  }
}
