import { UpdateBudgetsService } from "../../services/update/update-budgets.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { invalidateCacheByPrefix } from "../../../../shared/cache/in-memory-cache.js";

export function updateBudgetsController() {
  const updateBudgetsService = new UpdateBudgetsService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const budget = await updateBudgetsService.updateBudget(
        auth.userId,
        req.params.id,
        req.body,
        {
          authorization: auth.authorization,
          cookieHeader: auth.cookieHeader,
          requestId: req.requestId,
        },
      );
      invalidateCacheByPrefix(`budgets:list:${auth.userId}:`);
      res.json(budget);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
