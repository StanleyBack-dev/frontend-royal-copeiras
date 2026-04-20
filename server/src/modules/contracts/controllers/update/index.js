import { UpdateContractsService } from "../../services/update/update-contracts.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { invalidateCacheByPrefix } from "../../../../shared/cache/in-memory-cache.js";

export function updateContractsController() {
  const updateContractsService = new UpdateContractsService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const contract = await updateContractsService.updateContract(
        auth.userId,
        req.params.id,
        req.body,
        {
          authorization: auth.authorization,
          cookieHeader: auth.cookieHeader,
          requestId: req.requestId,
        },
      );
      invalidateCacheByPrefix(`contracts:list:${auth.userId}:`);
      res.json(contract);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
