import { GetSignaturesService } from "../services/get-signatures.service.js";
import { getAuthContext } from "../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../shared/http/http-error.js";

export function getSignaturesController() {
  const service = new GetSignaturesService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const page = Number.parseInt(String(req.query.page || "1"), 10) || 1;
      const limit = Number.parseInt(String(req.query.limit || "50"), 10) || 50;

      const data = await service.execute(
        auth.userId,
        {
          page,
          limit,
          idContracts: req.query.idContracts || undefined,
          status: req.query.status || undefined,
        },
        {
          authorization: auth.authorization,
          cookieHeader: auth.cookieHeader,
          requestId: req.requestId,
        },
      );
      res.json(data);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
