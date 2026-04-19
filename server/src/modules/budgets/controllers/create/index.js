import { CreateBudgetsService } from "../../services/create/create-budgets.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { invalidateCacheByPrefix } from "../../../../shared/cache/in-memory-cache.js";

export function createBudgetsController() {
  const createBudgetsService = new CreateBudgetsService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const budget = await createBudgetsService.createBudget(
        auth.userId,
        req.body,
        {
          authorization: auth.authorization,
          cookieHeader: auth.cookieHeader,
          requestId: req.requestId,
        },
      );
      invalidateCacheByPrefix(`budgets:list:${auth.userId}:`);
      res.status(201).json(budget);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
