import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { invalidateCacheByPrefix } from "../../../../shared/cache/in-memory-cache.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { CloseContractWithoutSignatureService } from "../../services/pdf/close-contract-without-signature.service.js";

export function closeContractWithoutSignatureController() {
  const closeContractWithoutSignatureService =
    new CloseContractWithoutSignatureService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const data = await closeContractWithoutSignatureService.execute(
        auth.userId,
        req.params.id,
        {
          authorization: auth.authorization,
          cookieHeader: auth.cookieHeader,
          requestId: req.requestId,
        },
      );

      invalidateCacheByPrefix(`contracts:list:${auth.userId}:`);
      res.json(data);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
