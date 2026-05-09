import { UpdateEventAssignmentService } from "../../services/update/update-event-assignment.service.js";
import { UpdateEventService } from "../../services/update/update-event.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";

const STATUS_TO_GRAPHQL_ENUM = {
  scheduled: "SCHEDULED",
  in_progress: "IN_PROGRESS",
  completed: "COMPLETED",
  canceled: "CANCELED",
};

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

export function updateEventController() {
  const service = new UpdateEventService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);

      const rawStatus =
        typeof req.body?.status === "string" ? req.body.status : undefined;
      const mappedStatus = rawStatus
        ? STATUS_TO_GRAPHQL_ENUM[rawStatus] || undefined
        : undefined;

      const payload = {
        ...req.body,
        ...(mappedStatus ? { status: mappedStatus } : {}),
      };

      const data = await service.execute(auth.userId, req.params.id, payload, {
        authorization: auth.authorization,
        cookieHeader: auth.cookieHeader,
        requestId: req.requestId,
      });
      res.json(data);
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      res.status(statusCode).json({ error: error.message || "Unknown error" });
    }
  };
}
