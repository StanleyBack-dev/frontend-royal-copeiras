import { SendBudgetEmailService } from "../../services/pdf/send-budget-email.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";

export function sendBudgetEmailController() {
  const sendBudgetEmailService = new SendBudgetEmailService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const { id } = req.params;
      const data = await sendBudgetEmailService.execute(auth.userId, id, {
        authorization: auth.authorization,
        cookieHeader: auth.cookieHeader,
        requestId: req.requestId,
      });

      res.json(data);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
