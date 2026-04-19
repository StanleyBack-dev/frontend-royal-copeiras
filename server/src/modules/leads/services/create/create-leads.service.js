import { executeGraphql } from "../../../../shared/http/graphql-client.js";
import {
  mapLeadInputToGraphql,
  mapLeadMutationResponseFromGraphql,
} from "../shared/lead-enum-mapper.js";

export class CreateLeadsService {
  async createLead(userId, input, context = {}) {
    const mutation = `
      mutation CreateLeads($input: CreateLeadsInputDto!) {
        createLeads(input: $input) {
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

    const data = await executeGraphql({
      query: mutation,
      variables: { input: mapLeadInputToGraphql(input) },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return mapLeadMutationResponseFromGraphql(data.createLeads);
  }
}
