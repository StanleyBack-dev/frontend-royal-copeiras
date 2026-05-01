import { GetEventsService } from "../../services/get/get-events.service.js";
import { getAuthContext } from "../../../../shared/auth/get-user-id.js";
import { HttpError } from "../../../../shared/http/http-error.js";

const STATUS_TO_GRAPHQL_ENUM = {
  scheduled: "SCHEDULED",
  in_progress: "IN_PROGRESS",
  completed: "COMPLETED",
  canceled: "CANCELED",
};

export function getEventsController() {
  const service = new GetEventsService();

  return async (req, res) => {
    try {
      const auth = getAuthContext(req);
      const page = Number.parseInt(String(req.query.page || "1"), 10) || 1;
      const limit = Number.parseInt(String(req.query.limit || "10"), 10) || 10;
      const rawStatus =
        typeof req.query.status === "string" ? req.query.status : undefined;
      const mappedStatus = rawStatus
        ? STATUS_TO_GRAPHQL_ENUM[rawStatus] || undefined
        : undefined;

      const data = await service.execute(
        auth.userId,
        {
          page,
          limit,
          idEvents: req.query.idEvents || undefined,
          idContracts: req.query.idContracts || undefined,
          status: mappedStatus,
          startDate: req.query.startDate || undefined,
          endDate: req.query.endDate || undefined,
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
