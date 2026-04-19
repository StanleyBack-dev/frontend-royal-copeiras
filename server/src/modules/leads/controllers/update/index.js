import { UpdateLeadsService } from "../../services/update/update-leads.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { invalidateCacheByPrefix } from "../../../../shared/cache/in-memory-cache.js";

export function updateLeadsController() {
  const updateLeadsService = new UpdateLeadsService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const lead = await updateLeadsService.updateLead(
        auth.userId,
        req.params.id,
        req.body,
        {
          authorization: auth.authorization,
          cookieHeader: auth.cookieHeader,
          requestId: req.requestId,
        },
      );
      invalidateCacheByPrefix(`leads:list:${auth.userId}:`);
      res.json(lead);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
