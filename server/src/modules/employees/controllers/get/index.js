import { GetEmployeesService } from "../../services/get/get-employees.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { buildListInput } from "../../../../shared/http/parse-pagination.js";

export function getEmployeesController() {
  const getEmployeesService = new GetEmployeesService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const input = buildListInput(req.query, [
        "idEmployees",
        "startDate",
        "endDate",
      ]);
      const employees = await getEmployeesService.findAll(auth.userId, input, {
        authorization: auth.authorization,
        requestId: req.requestId,
      });
      res.json(employees);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
