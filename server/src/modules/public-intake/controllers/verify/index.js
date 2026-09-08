import { VerifyPublicIntakeCodeService } from "../../services/verify/verify-public-intake-code.service.js";
import { HttpError } from "../../../../shared/http/http-error.js";

// Public endpoint: the code itself is the only credential needed here, no
// session/auth headers are expected or forwarded.
export function verifyPublicIntakeCodeController() {
  const verifyPublicIntakeCodeService = new VerifyPublicIntakeCodeService();

  return async (req, res) => {
    try {
      const result = await verifyPublicIntakeCodeService.verifyCode(
        req.body.code,
      );

      res.json(result);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
