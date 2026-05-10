import { CreatePaymentsService } from "../../services/create/create-payments.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { invalidateCacheByPrefix } from "../../../../shared/cache/in-memory-cache.js";

export function createPaymentsController() {
  const createPaymentsService = new CreatePaymentsService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const payment = await createPaymentsService.createPayment(
        auth.userId,
        req.body,
        {
          authorization: auth.authorization,
          cookieHeader: auth.cookieHeader,
          requestId: req.requestId,
        },
      );

      invalidateCacheByPrefix(`payments:list:${auth.userId}:`);
      res.status(201).json(payment);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
