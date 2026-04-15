import { CreateEmployeesService } from "../../services/create/create-employees.service.js";

function getUserId(req) {
  return req.headers["x-user-id"] || "00000000-0000-0000-0000-000000000001";
}

export function createEmployeesController() {
  const createEmployeesService = new CreateEmployeesService();

  return async (req, res) => {
    try {
      const userId = getUserId(req);
      const employee = await createEmployeesService.createEmployee(
        userId,
        req.body,
      );
      res.status(201).json(employee);
    } catch (error) {
      res.status(500).json({ error: error.message || "Unknown error" });
    }
  };
}
