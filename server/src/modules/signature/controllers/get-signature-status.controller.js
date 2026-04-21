import { GetSignatureStatusService } from "../services/get-signature-status.service.js";
import { getAuthContext } from "../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../shared/http/http-error.js";

export function getSignatureStatusController() {
  const service = new GetSignatureStatusService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const requestId = req.params.requestId || req.body?.requestId;

      const data = await service.execute(auth.userId, requestId, {
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
