import { UpdateCustomersService } from "../../services/update/update-customers.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { invalidateCacheByPrefix } from "../../../../shared/cache/in-memory-cache.js";

export function updateCustomersController() {
  const updateCustomersService = new UpdateCustomersService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const customer = await updateCustomersService.updateCustomer(
        auth.userId,
        req.params.id,
        req.body,
        {
          authorization: auth.authorization,
          cookieHeader: auth.cookieHeader,
          requestId: req.requestId,
        },
      );
      invalidateCacheByPrefix(`customers:list:${auth.userId}:`);

      res.json(customer);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
