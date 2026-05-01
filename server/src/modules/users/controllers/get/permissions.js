import { GetUserPagePermissionsService } from "../../services/get/get-user-page-permissions.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";

export function getUserPagePermissionsController() {
  const service = new GetUserPagePermissionsService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const result = await service.execute(auth.userId, req.params.id, {
        authorization: auth.authorization,
        cookieHeader: auth.cookieHeader,
        requestId: req.requestId,
      });

      // Do not allow intermediate caches to store permission responses.
      res.set("Cache-Control", "no-store, no-cache, must-revalidate");
      res.json(result);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
