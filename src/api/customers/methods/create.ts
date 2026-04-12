import axios from 'axios';
import type { CreateCustomerPayload, Customer } from '../types';

const API_BASE_URL = '/api/customers';

export async function createCustomer(payload: CreateCustomerPayload, userId: string): Promise<Customer> {
  const response = await axios.post(API_BASE_URL, payload, {
    headers: {
      'x-user-id': userId,
    },
  });
  return response.data;
}
