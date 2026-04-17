import { HttpError } from "../http/http-error.js";
import { devAuthConfig } from "./dev-auth.config.js";

export function getAuthContext(req) {
  if (devAuthConfig.enabled) {
    return {
      userId: devAuthConfig.userId,
      authorization: devAuthConfig.bearerToken?.trim()
        ? `Bearer ${devAuthConfig.bearerToken.trim()}`
        : undefined,
      source: "dev-auth-config",
    };
  }

  const userIdHeader = req.headers["x-user-id"];
  const authorizationHeader = req.headers.authorization;

  if (typeof userIdHeader !== "string" || !userIdHeader.trim()) {
    throw new HttpError(401, "Missing x-user-id header.");
  }

  if (typeof authorizationHeader !== "string" || !authorizationHeader.trim()) {
    throw new HttpError(401, "Missing Authorization header.");
  }

  return {
    userId: userIdHeader.trim(),
    authorization: authorizationHeader.trim(),
    source: "request-headers",
  };
}

export function getUserId(req) {
  return getAuthContext(req).userId;
}
