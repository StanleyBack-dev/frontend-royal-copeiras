import { UpdateEmployeesService } from "../../services/update/update-employees.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { invalidateCacheByPrefix } from "../../../../shared/cache/in-memory-cache.js";

export function updateEmployeesController() {
  const updateEmployeesService = new UpdateEmployeesService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const employee = await updateEmployeesService.updateEmployee(
        auth.userId,
        req.params.id,
        req.body,
        {
          authorization: auth.authorization,
          cookieHeader: auth.cookieHeader,
          requestId: req.requestId,
        },
      );
      invalidateCacheByPrefix(`employees:list:${auth.userId}:`);

      res.json(employee);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
