import { executeGraphql } from "../../../../shared/http/graphql-client.js";
import {
  mapContractInputToGraphql,
  mapContractMutationResponseFromGraphql,
} from "../shared/contract-enum-mapper.js";

export class UpdateContractsService {
  async updateContract(userId, idContracts, input, context = {}) {
    const mutation = `
      mutation UpdateContracts($input: UpdateContractsInputDto!) {
        updateContracts(input: $input) {
          success
          message
          code
          data {
            idContracts
            idBudgets
            idLeads
            budgetNumber
            contractNumber
            status
            issueDate
            validUntil
            effectiveDate
            expiresAt
            body
            templateVersion
            retentionUntil
            sentVia
            sentAt
            notes
            createdAt
            updatedAt
          }
        }
      }
    `;

    const sanitizedInput = {
      ...input,
      idContracts,
    };

    delete sanitizedInput.createdAt;
    delete sanitizedInput.updatedAt;
    delete sanitizedInput.budgetNumber;
    delete sanitizedInput.contractNumber;
    delete sanitizedInput.issueDate;
    delete sanitizedInput.idBudgets;

    const data = await executeGraphql({
      query: mutation,
      variables: { input: mapContractInputToGraphql(sanitizedInput) },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return mapContractMutationResponseFromGraphql(data.updateContracts);
  }
}
