import { executeGraphql } from "../../../../shared/http/graphql-client.js";
import {
  mapLeadInputToGraphql,
  mapLeadMutationResponseFromGraphql,
} from "../shared/lead-enum-mapper.js";

export class UpdateLeadsService {
  async updateLead(userId, idLeads, input, context = {}) {
    const mutation = `
      mutation UpdateLeads($input: UpdateLeadsInputDto!) {
        updateLeads(input: $input) {
          success
          message
          code
          data {
            idLeads
            name
            email
            phone
            document
            source
            notes
            status
            isActive
            createdAt
            updatedAt
          }
        }
      }
    `;

    const sanitizedInput = {
      ...input,
      idLeads,
    };

    delete sanitizedInput.createdAt;
    delete sanitizedInput.updatedAt;

    const data = await executeGraphql({
      query: mutation,
      variables: { input: mapLeadInputToGraphql(sanitizedInput) },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return mapLeadMutationResponseFromGraphql(data.updateLeads);
  }
}
