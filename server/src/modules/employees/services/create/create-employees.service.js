import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class CreateEmployeesService {
  async createEmployee(userId, input, context = {}) {
    const mutation = `
      mutation CreateEmployees($input: CreateEmployeesInputDto!) {
        createEmployees(input: $input) {
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
    const sanitizedInput = { ...input };
    delete sanitizedInput.createdAt;
    delete sanitizedInput.updatedAt;

    const data = await executeGraphql({
      query: mutation,
      variables: { input: sanitizedInput },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    return data.createEmployees;
  }
}
