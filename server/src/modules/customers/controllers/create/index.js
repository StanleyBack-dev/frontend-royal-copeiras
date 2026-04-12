import { CreateCustomersService } from '../../services/create/create-customers.service.js';

function getUserId(req) {
  // Mock para ambiente local
  return req.headers['x-user-id'] || '00000000-0000-0000-0000-000000000001';
}

export function createCustomersController() {
  const createCustomersService = new CreateCustomersService();
  return async (req, res) => {
    try {
      const userId = getUserId(req);
      const customer = await createCustomersService.createCustomer(userId, req.body);
      res.status(201).json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message || 'Unknown error' });
    }
  };
}
