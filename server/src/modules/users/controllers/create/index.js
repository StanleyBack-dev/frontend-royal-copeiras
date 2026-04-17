import { CreateUsersService } from "../../services/create/create-users.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { invalidateCacheByPrefix } from "../../../../shared/cache/in-memory-cache.js";

export function createUsersController() {
  const createUsersService = new CreateUsersService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const user = await createUsersService.createUser(auth.userId, req.body, {
        authorization: auth.authorization,
        requestId: req.requestId,
      });
      invalidateCacheByPrefix(`users:list:${auth.userId}:`);
      res.status(201).json(user);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}