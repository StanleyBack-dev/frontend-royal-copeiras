import { SubmitPublicIntakeService } from "../../services/submit/submit-public-intake.service.js";
import { HttpError } from "../../../../shared/http/http-error.js";

// Public endpoint: gated by the form token issued after a successful code
// verification, no session/auth headers are expected or forwarded.
export function submitPublicIntakeController() {
  const submitPublicIntakeService = new SubmitPublicIntakeService();

  return async (req, res) => {
    try {
      const result = await submitPublicIntakeService.submit(req.body);

      res.json(result);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
