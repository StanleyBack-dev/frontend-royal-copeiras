import { UnlockUserCredentialService } from "../../services/update/unlock-user-credential.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { invalidateCacheByPrefix } from "../../../../shared/cache/in-memory-cache.js";

export function unlockUserCredentialController() {
  const unlockService = new UnlockUserCredentialService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const result = await unlockService.unlockUser(
        auth.userId,
        req.params.id,
        {
          authorization: auth.authorization,
          requestId: req.requestId,
        },
      );
      invalidateCacheByPrefix(`users:list:${auth.userId}:`);

      res.json(result);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
