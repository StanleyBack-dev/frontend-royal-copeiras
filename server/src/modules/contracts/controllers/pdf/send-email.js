import { SendContractEmailService } from "../../services/pdf/send-contract-email.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { invalidateCacheByPrefix } from "../../../../shared/cache/in-memory-cache.js";

export function sendContractEmailController() {
  const sendContractEmailService = new SendContractEmailService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const data = await sendContractEmailService.execute(
        auth.userId,
        req.params.id,
        {
          authorization: auth.authorization,
          cookieHeader: auth.cookieHeader,
          requestId: req.requestId,
        },
      );

      invalidateCacheByPrefix(`contracts:list:${auth.userId}:`);
      res.json(data);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
