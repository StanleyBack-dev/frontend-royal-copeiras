import { CreatePositionsService } from "../../services/create/create-positions.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { invalidateCacheByPrefix } from "../../../../shared/cache/in-memory-cache.js";

export function createPositionsController() {
  const createPositionsService = new CreatePositionsService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const position = await createPositionsService.createPosition(
        auth.userId,
        req.body,
        {
          authorization: auth.authorization,
          cookieHeader: auth.cookieHeader,
          requestId: req.requestId,
        },
      );

      invalidateCacheByPrefix("positions:list:");
      res.status(201).json(position);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
