import { CreateLeadsService } from "../../services/create/create-leads.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { invalidateCacheByPrefix } from "../../../../shared/cache/in-memory-cache.js";

export function createLeadsController() {
  const createLeadsService = new CreateLeadsService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const lead = await createLeadsService.createLead(auth.userId, req.body, {
        authorization: auth.authorization,
        cookieHeader: auth.cookieHeader,
        requestId: req.requestId,
      });
      invalidateCacheByPrefix(`leads:list:${auth.userId}:`);
      res.status(201).json(lead);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
