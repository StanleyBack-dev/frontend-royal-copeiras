import { DownloadBudgetPdfService } from "../../services/pdf/download-budget-pdf.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";

export function downloadBudgetPdfController() {
  const downloadBudgetPdfService = new DownloadBudgetPdfService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const data = await downloadBudgetPdfService.execute(
        auth.userId,
        req.params.id,
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
