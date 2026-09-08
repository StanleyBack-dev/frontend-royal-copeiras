import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class SubmitPublicIntakeService {
  async submit(input) {
    const mutation = `
      mutation SubmitPublicIntake($input: SubmitPublicIntakeInputDto!) {
        submitPublicIntake(input: $input) {
          success
          message
          code
          data {
            idLeads
            idBudgets
          }
        }
      }
    `;

    const data = await executeGraphql({
      query: mutation,
      variables: { input },
      isPublic: true,
    });

    return data.submitPublicIntake;
  }
}
