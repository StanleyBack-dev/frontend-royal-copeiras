import { UpdateSuppliesService } from "../../services/update/update-supplies.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { invalidateCacheByPrefix } from "../../../../shared/cache/in-memory-cache.js";

export function updateSuppliesController() {
  const updateSuppliesService = new UpdateSuppliesService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const supply = await updateSuppliesService.updateSupply(
        auth.userId,
        req.params.id,
        req.body,
        {
          authorization: auth.authorization,
          cookieHeader: auth.cookieHeader,
          requestId: req.requestId,
        },
      );

      invalidateCacheByPrefix("supplies:list:");
      res.json(supply);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
