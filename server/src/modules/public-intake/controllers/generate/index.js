import { GeneratePublicIntakeCodeService } from "../../services/generate/generate-public-intake-code.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";

export function generatePublicIntakeCodeController() {
  const generatePublicIntakeCodeService = new GeneratePublicIntakeCodeService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const result = await generatePublicIntakeCodeService.generateCode(
        auth.userId,
        {
          authorization: auth.authorization,
          cookieHeader: auth.cookieHeader,
          requestId: req.requestId,
        },
      );

      res.json(result);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
