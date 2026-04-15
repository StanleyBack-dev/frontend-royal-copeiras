import { UpdateEmployeesService } from "../../services/update/update-employees.service.js";

function getUserId(req) {
  return req.headers["x-user-id"] || "00000000-0000-0000-0000-000000000001";
}

export function updateEmployeesController() {
  const updateEmployeesService = new UpdateEmployeesService();

  return async (req, res) => {
    try {
      const userId = getUserId(req);
      const employee = await updateEmployeesService.updateEmployee(
        userId,
        req.params.id,
        req.body,
      );

      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: error.message || "Unknown error" });
    }
  };
}
