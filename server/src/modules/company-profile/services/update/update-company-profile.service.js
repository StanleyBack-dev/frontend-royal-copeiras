import { executeGraphql } from "../../../../shared/http/graphql-client.js";
import { COMPANY_PROFILE_FIELDS } from "../shared/company-profile-graphql-fields.js";

const ALLOWED_INPUT_FIELDS = [
  "legalName",
  "tradeName",
  "document",
  "stateRegistration",
  "municipalRegistration",
  "email",
  "phone",
  "address",
  "addressCity",
  "addressState",
  "addressZipCode",
  "representativeName",
  "representativeRole",
  "representativeDocument",
  "pixKey",
  "pixKeyType",
  "issueCity",
  "website",
];

function sanitizeInput(input = {}) {
  const sanitized = {};
  for (const field of ALLOWED_INPUT_FIELDS) {
    if (input[field] !== undefined) {
      sanitized[field] = input[field];
    }
  }
  return sanitized;
}

export class UpdateCompanyProfileService {
  async updateProfile(userId, input, context = {}) {
    const mutation = `
      mutation UpdateCompanyProfile($input: UpdateCompanyProfileInputDto!) {
        updateCompanyProfile(input: $input) {
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
      query: mutation,
      variables: { input: sanitizeInput(input) },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return data.updateCompanyProfile;
  }
}
