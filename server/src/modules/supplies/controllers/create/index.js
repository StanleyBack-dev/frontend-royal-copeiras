import { CreateSuppliesService } from "../../services/create/create-supplies.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { invalidateCacheByPrefix } from "../../../../shared/cache/in-memory-cache.js";

export function createSuppliesController() {
  const createSuppliesService = new CreateSuppliesService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const supply = await createSuppliesService.createSupply(
        auth.userId,
        req.body,
        {
          authorization: auth.authorization,
          cookieHeader: auth.cookieHeader,
          requestId: req.requestId,
        },
      );

      invalidateCacheByPrefix("supplies:list:");
      res.status(201).json(supply);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
