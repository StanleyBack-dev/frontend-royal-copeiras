import { AuthService } from "../services/auth.service.js";
import { buildErrorResponse } from "../../../shared/http/error-response.js";

const authService = new AuthService();

function applySetCookieHeaders(res, setCookieHeaders) {
  if (Array.isArray(setCookieHeaders) && setCookieHeaders.length > 0) {
    res.setHeader("Set-Cookie", setCookieHeaders);
  }
}

function handleControllerError(res, error) {
  const { statusCode, body } = buildErrorResponse(error);
  res.status(statusCode).json(body);
}

export function loginController() {
  return async (req, res) => {
    try {
      const result = await authService.login(req.body, {
        cookieHeader: req.headers.cookie,
      });
      applySetCookieHeaders(res, result.setCookieHeaders);
      res.status(200).json(result.data);
    } catch (error) {
      handleControllerError(res, error);
    }
  };
}

export function refreshAuthSessionController() {
  return async (req, res) => {
    try {
      const result = await authService.refreshSession({
        cookieHeader: req.headers.cookie,
      });
      applySetCookieHeaders(res, result.setCookieHeaders);
      res.status(200).json(result.data);
    } catch (error) {
      handleControllerError(res, error);
    }
  };
}

export function logoutController() {
  return async (req, res) => {
    try {
      const result = await authService.logout({
        cookieHeader: req.headers.cookie,
      });
      applySetCookieHeaders(res, result.setCookieHeaders);
      res.status(200).json(result.data);
    } catch (error) {
      handleControllerError(res, error);
    }
  };
}

export function changeMyPasswordController() {
  return async (req, res) => {
    try {
      const result = await authService.changeMyPassword(req.body, {
        cookieHeader: req.headers.cookie,
      });
      applySetCookieHeaders(res, result.setCookieHeaders);
      res.status(200).json(result.data);
    } catch (error) {
      handleControllerError(res, error);
    }
  };
}
