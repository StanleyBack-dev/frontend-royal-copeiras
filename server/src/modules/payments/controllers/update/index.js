import { UpdatePaymentsService } from "../../services/update/update-payments.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { invalidateCacheByPrefix } from "../../../../shared/cache/in-memory-cache.js";

export function updatePaymentsController() {
  const updatePaymentsService = new UpdatePaymentsService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const payment = await updatePaymentsService.updatePayment(
        auth.userId,
        req.params.id,
        req.body,
        {
          authorization: auth.authorization,
          cookieHeader: auth.cookieHeader,
          requestId: req.requestId,
        },
      );

      invalidateCacheByPrefix(`payments:list:${auth.userId}:`);
      res.json(payment);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
