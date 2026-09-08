import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class VerifyPublicIntakeCodeService {
  async verifyCode(code) {
    const mutation = `
      mutation VerifyPublicIntakeCode($input: VerifyPublicIntakeCodeInputDto!) {
        verifyPublicIntakeCode(input: $input) {
          success
          message
          code
          data {
            formToken
            expiresAt
          }
        }
      }
    `;

    const data = await executeGraphql({
      query: mutation,
      variables: { input: { code } },
      isPublic: true,
    });

    return data.verifyPublicIntakeCode;
  }
}
