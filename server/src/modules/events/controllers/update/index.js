import { UpdateEventAssignmentService } from "../../services/update/update-event-assignment.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";

export function updateEventAssignmentController() {
  const service = new UpdateEventAssignmentService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);

      const data = await service.execute(
        auth.userId,
        {
          idEventAssignments: req.params.id,
          ...req.body,
        },
        {
          authorization: auth.authorization,
          cookieHeader: auth.cookieHeader,
          requestId: req.requestId,
        },
      );
      res.json(data);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
