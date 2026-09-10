import { GetSuppliesService } from "../../services/get/get-supplies.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { buildListInput } from "../../../../shared/http/parse-pagination.js";

export function getSuppliesController() {
  const getSuppliesService = new GetSuppliesService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const input = buildListInput(req.query, [
        "idSupplies",
        "search",
        "isActive",
      ]);
      const supplies = await getSuppliesService.findAll(auth.userId, input, {
        authorization: auth.authorization,
        cookieHeader: auth.cookieHeader,
        requestId: req.requestId,
      });

      res.json(supplies);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
