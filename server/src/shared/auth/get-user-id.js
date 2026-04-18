import { HttpError } from "../http/http-error.js";
import { devAuthConfig } from "./dev-auth.config.js";

export function getAuthContext(req) {
  const userIdHeader = req.headers["x-user-id"];
  const authorizationHeader = req.headers.authorization;
  const cookieHeader = req.headers.cookie;

  const hasUserId =
    typeof userIdHeader === "string" && Boolean(userIdHeader.trim());
  const hasAuthorization =
    typeof authorizationHeader === "string" &&
    Boolean(authorizationHeader.trim());
  const hasCookie =
    typeof cookieHeader === "string" && Boolean(cookieHeader.trim());

  if (hasUserId && hasAuthorization) {
    return {
      userId: userIdHeader.trim(),
      authorization: authorizationHeader.trim(),
      cookieHeader: undefined,
      source: "request-headers",
    };
  }

  if (hasUserId && hasCookie) {
    return {
      userId: userIdHeader.trim(),
      authorization: undefined,
      cookieHeader: cookieHeader.trim(),
      source: "request-cookies",
    };
  }

  if (devAuthConfig.enabled) {
    return {
      userId: devAuthConfig.userId,
      authorization: devAuthConfig.bearerToken?.trim()
        ? `Bearer ${devAuthConfig.bearerToken.trim()}`
        : undefined,
      cookieHeader: undefined,
      source: "dev-auth-config",
    };
  }

  if (!hasUserId) {
    throw new HttpError(401, "Missing x-user-id header.");
  }

  throw new HttpError(
    401,
    "Missing Authorization header or auth cookies in request.",
  );
}

export function getUserId(req) {
  return getAuthContext(req).userId;
}
