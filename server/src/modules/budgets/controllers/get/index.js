import { GetBudgetsService } from "../../services/get/get-budgets.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { buildListInput } from "../../../../shared/http/parse-pagination.js";

export function getBudgetsController() {
  const getBudgetsService = new GetBudgetsService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const input = buildListInput(req.query, [
        "idBudgets",
        "idLeads",
        "status",
        "startDate",
        "endDate",
      ]);
      const budgets = await getBudgetsService.findAll(auth.userId, input, {
        authorization: auth.authorization,
        cookieHeader: auth.cookieHeader,
        requestId: req.requestId,
      });
      res.json(budgets);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
