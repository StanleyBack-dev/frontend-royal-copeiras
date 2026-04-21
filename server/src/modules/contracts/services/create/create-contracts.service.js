import { executeGraphql } from "../../../../shared/http/graphql-client.js";
import {
  mapContractInputToGraphql,
  mapContractMutationResponseFromGraphql,
} from "../shared/contract-enum-mapper.js";

export class CreateContractsService {
  async createContract(userId, input, context = {}) {
    const mutation = `
      mutation CreateContracts($input: CreateContractsInputDto!) {
        createContracts(input: $input) {
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

    const data = await executeGraphql({
      query: mutation,
      variables: { input: mapContractInputToGraphql(input) },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return mapContractMutationResponseFromGraphql(data.createContracts);
  }
}
