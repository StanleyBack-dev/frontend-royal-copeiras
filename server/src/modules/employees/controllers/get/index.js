import { GetEmployeesService } from "../../services/get/get-employees.service.js";

function getUserId(req) {
  return req.headers["x-user-id"] || "mock-user-id";
}

export function getEmployeesController() {
  const getEmployeesService = new GetEmployeesService();

  return async (req, res) => {
    try {
      const userId = getUserId(req);
      const employees = await getEmployeesService.findAll(userId);
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: error.message || "Unknown error" });
    }
  };
}
