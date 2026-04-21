import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { invalidateCacheByPrefix } from "../../../../shared/cache/in-memory-cache.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { SendContractSignatureRequestService } from "../../services/pdf/send-contract-signature-request.service.js";

export function sendContractSignatureRequestController() {
  const sendContractSignatureRequestService =
    new SendContractSignatureRequestService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const data = await sendContractSignatureRequestService.execute(
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
