import { GetCustomersService } from "../../services/get/get-customers.service.js";

// Exemplo de autenticação simples (ajuste para produção)
function getUserId(req) {
  return req.headers["x-user-id"] || "mock-user-id";
}

export function getCustomersController() {
  const getCustomersService = new GetCustomersService();
  return async (req, res) => {
    try {
      const userId = getUserId(req);
      const customers = await getCustomersService.findAll(userId);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: error.message || "Unknown error" });
    }
  };
}
