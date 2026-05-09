import { UpdatePositionsService } from "../../services/update/update-positions.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { invalidateCacheByPrefix } from "../../../../shared/cache/in-memory-cache.js";

export function updatePositionsController() {
  const updatePositionsService = new UpdatePositionsService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const position = await updatePositionsService.updatePosition(
        auth.userId,
        req.params.id,
        req.body,
        {
          authorization: auth.authorization,
          cookieHeader: auth.cookieHeader,
          requestId: req.requestId,
        },
      );

      invalidateCacheByPrefix("positions:list:");
      res.json(position);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
