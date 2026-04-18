import { CreateCustomersService } from "../../services/create/create-customers.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { invalidateCacheByPrefix } from "../../../../shared/cache/in-memory-cache.js";

export function createCustomersController() {
  const createCustomersService = new CreateCustomersService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const customer = await createCustomersService.createCustomer(
        auth.userId,
        req.body,
        {
          authorization: auth.authorization,
          cookieHeader: auth.cookieHeader,
          requestId: req.requestId,
        },
      );
      invalidateCacheByPrefix(`customers:list:${auth.userId}:`);
      res.status(201).json(customer);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
