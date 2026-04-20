import { executeGraphql } from "../../../../shared/http/graphql-client.js";
import {
  buildCacheKey,
  getOrSetCache,
} from "../../../../shared/cache/in-memory-cache.js";
import { config } from "../../../../config/env.js";
import {
  mapContractInputToGraphql,
  mapContractListResponseFromGraphql,
} from "../shared/contract-enum-mapper.js";

export class GetContractsService {
  async findAll(userId, input = {}, context = {}) {
    const query = `
      query GetContracts($input: GetContractsInputDto) {
        getContracts(input: $input) {
          success
          message
          code
          items {
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
            signatureProvider
            signatureEnvelopeId
            signatureStatus
            signedByName
            signedByDocument
            signedByEmail
            signerIp
            signerUserAgent
            signedAt
            consentAt
            sentVia
            sentAt
            notes
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

    const mappedInput = mapContractInputToGraphql(input);
    const cacheKey = buildCacheKey("contracts:list", userId, mappedInput);

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

        return mapContractListResponseFromGraphql(data.getContracts);
      },
      config.listCacheTtlMs,
    );
  }
}
