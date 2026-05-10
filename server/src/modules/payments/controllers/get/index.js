import { GetPaymentsService } from "../../services/get/get-payments.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { buildListInput } from "../../../../shared/http/parse-pagination.js";

export function getPaymentsController() {
  const getPaymentsService = new GetPaymentsService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const input = buildListInput(req.query, [
        "idPayments",
        "idLeads",
        "idBudgets",
        "idContracts",
        "idEvents",
        "status",
        "startDate",
        "endDate",
      ]);

      const payments = await getPaymentsService.findAll(auth.userId, input, {
        authorization: auth.authorization,
        cookieHeader: auth.cookieHeader,
        requestId: req.requestId,
      });

      res.json(payments);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
