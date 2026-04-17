import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class UpdateEmployeesService {
  async updateEmployee(userId, idEmployees, input, context = {}) {
    const mutation = `
      mutation UpdateEmployees($input: UpdateEmployeesInputDto!) {
        updateEmployees(input: $input) {
          success
          message
          code
          data {
            idEmployees
            name
            document
            email
            phone
            position
            isActive
            createdAt
            updatedAt
          }
        }
      }
    `;

    const sanitizedInput = {
      ...input,
      idEmployees,
    };

    delete sanitizedInput.createdAt;
    delete sanitizedInput.updatedAt;

    const data = await executeGraphql({
      query: mutation,
      variables: { input: sanitizedInput },
      userId,
      authorization: context.authorization,
      requestId: context.requestId,
    });

    return data.updateEmployees;
  }
}
