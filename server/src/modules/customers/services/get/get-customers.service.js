import axios from 'axios';
import { config } from '../../../../config/env.js';

export class GetCustomersService {
  async findAll(userId, input = {}) {
    const query = `
      query GetCustomers($input: GetCustomersInputDto) {
        getCustomers(input: $input) {
          idCustomers
          name
          document
          type
          email
          phone
          birthDate
          address
          isActive
          createdAt
          updatedAt
        }
      }
    `;
    const variables = { input };
    const headers = {
      'x-user-id': userId,
      'Authorization': `Bearer ${userId}`
    };
    const response = await axios.post(
      config.backendGraphqlUrl,
      { query, variables },
      { headers }
    );
    return response.data.data.getCustomers;
  }
}
