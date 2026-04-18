import { GetCustomersService } from "../../services/get/get-customers.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { buildListInput } from "../../../../shared/http/parse-pagination.js";

export function getCustomersController() {
  const getCustomersService = new GetCustomersService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const input = buildListInput(req.query, [
        "idCustomers",
        "startDate",
        "endDate",
      ]);
      const customers = await getCustomersService.findAll(auth.userId, input, {
        authorization: auth.authorization,
        cookieHeader: auth.cookieHeader,
        requestId: req.requestId,
      });
      res.json(customers);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
