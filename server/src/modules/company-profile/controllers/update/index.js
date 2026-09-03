import { UpdateCompanyProfileService } from "../../services/update/update-company-profile.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { invalidateCacheByPrefix } from "../../../../shared/cache/in-memory-cache.js";

export function updateCompanyProfileController() {
  const updateCompanyProfileService = new UpdateCompanyProfileService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const profile = await updateCompanyProfileService.updateProfile(
        auth.userId,
        req.body,
        {
          authorization: auth.authorization,
          cookieHeader: auth.cookieHeader,
          requestId: req.requestId,
        },
      );
      // Contract previews embed the company profile, so drop their caches.
      invalidateCacheByPrefix("contracts:list:");
      res.json(profile);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
