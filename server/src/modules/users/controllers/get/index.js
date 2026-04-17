import { GetUsersService } from "../../services/get/get-users.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";
import { buildListInput } from "../../../../shared/http/parse-pagination.js";

export function getUsersController() {
  const getUsersService = new GetUsersService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const input = buildListInput(req.query);
      const users = await getUsersService.findAll(auth.userId, input, {
        authorization: auth.authorization,
        requestId: req.requestId,
      });
      res.json(users);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}