import { GetPublicIntakeCodesService } from "../../services/get/get-public-intake-codes.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { buildListInput } from "../../../../shared/http/parse-pagination.js";

export function getPublicIntakeCodesController() {
  const getPublicIntakeCodesService = new GetPublicIntakeCodesService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const input = buildListInput(req.query, []);
      const codes = await getPublicIntakeCodesService.getCodes(
        auth.userId,
        input,
        {
          authorization: auth.authorization,
          cookieHeader: auth.cookieHeader,
          requestId: req.requestId,
        },
      );
      res.json(codes);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
