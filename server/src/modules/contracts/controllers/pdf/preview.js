import { GenerateContractPreviewService } from "../../services/pdf/generate-contract-preview.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";

export function generateContractPreviewController() {
  const generateContractPreviewService = new GenerateContractPreviewService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const data = await generateContractPreviewService.execute(
        auth.userId,
        req.body,
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
