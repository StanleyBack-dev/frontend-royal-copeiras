import { GetCompanyProfileService } from "../../services/get/get-company-profile.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";

export function getCompanyProfileController() {
  const getCompanyProfileService = new GetCompanyProfileService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const profile = await getCompanyProfileService.find(auth.userId, {
        authorization: auth.authorization,
        cookieHeader: auth.cookieHeader,
        requestId: req.requestId,
      });
      res.json(profile);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
