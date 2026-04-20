import { CreateContractsService } from "../../services/create/create-contracts.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { invalidateCacheByPrefix } from "../../../../shared/cache/in-memory-cache.js";

export function createContractsController() {
  const createContractsService = new CreateContractsService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const contract = await createContractsService.createContract(
        auth.userId,
        req.body,
        {
          authorization: auth.authorization,
          cookieHeader: auth.cookieHeader,
          requestId: req.requestId,
        },
      );
      invalidateCacheByPrefix(`contracts:list:${auth.userId}:`);
      res.status(201).json(contract);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
