import { GetLeadsService } from "../../services/get/get-leads.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { buildListInput } from "../../../../shared/http/parse-pagination.js";

export function getLeadsController() {
  const getLeadsService = new GetLeadsService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const input = buildListInput(req.query, [
        "idLeads",
        "status",
        "startDate",
        "endDate",
      ]);
      const leads = await getLeadsService.findAll(auth.userId, input, {
        authorization: auth.authorization,
        cookieHeader: auth.cookieHeader,
        requestId: req.requestId,
      });
      res.json(leads);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
