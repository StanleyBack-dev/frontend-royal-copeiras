import axios from 'axios';
import type { Customer } from '../types';

const API_BASE_URL = '/api/customers';

export async function getCustomers(userId: string): Promise<Customer[]> {
  const response = await axios.get(API_BASE_URL, {
    headers: {
      'x-user-id': userId,
    },
  });
  return response.data;
}
