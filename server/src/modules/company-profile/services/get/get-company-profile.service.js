import { executeGraphql } from "../../../../shared/http/graphql-client.js";
import { COMPANY_PROFILE_FIELDS } from "../shared/company-profile-graphql-fields.js";

export class GetCompanyProfileService {
  async find(userId, context = {}) {
    const query = `
      query GetCompanyProfile {
        getCompanyProfile {
          success
          message
          code
          data {
            ${COMPANY_PROFILE_FIELDS}
          }
        }
      }
    `;

    const data = await executeGraphql({
      query,
      variables: {},
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return data.getCompanyProfile;
  }
}
