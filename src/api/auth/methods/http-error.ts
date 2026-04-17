import { authApiErrorMessages } from "../../../features/auth/model/messages";

export class AuthApiError extends Error {
  code?: string | null;
  details?: unknown;
  statusCode?: number;

  constructor(
    message: string,
    options: {
      code?: string | null;
      details?: unknown;
      statusCode?: number;
    } = {},
  ) {
    super(message);
    this.name = "AuthApiError";
    this.code = options.code;
    this.details = options.details;
    this.statusCode = options.statusCode;
  }
}

export function normalizeAuthHttpError(
  error: unknown,
  fallbackMessage: string,
): AuthApiError {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: unknown } }).response === "object"
  ) {
    const responseData = (error as { response?: { data?: unknown } }).response
      ?.data;
    const statusCode =
      typeof (error as { response?: { status?: unknown } }).response?.status ===
      "number"
        ? ((error as { response?: { status?: number } }).response?.status ??
          undefined)
        : undefined;

    if (
      typeof responseData === "object" &&
      responseData !== null &&
      (("message" in responseData &&
        typeof (responseData as { message?: unknown }).message === "string") ||
        ("error" in responseData &&
          typeof (responseData as { error?: unknown }).error === "string"))
    ) {
      const code =
        "code" in responseData &&
        typeof (responseData as { code?: unknown }).code === "string"
          ? (responseData as { code: string }).code
          : null;

      const rawMessage =
        ("message" in responseData &&
        typeof (responseData as { message?: unknown }).message === "string"
          ? (responseData as { message: string }).message
          : undefined) ||
        ("error" in responseData &&
        typeof (responseData as { error?: unknown }).error === "string"
          ? (responseData as { error: string }).error
          : fallbackMessage);

      const mappedMessage =
        code && code in authApiErrorMessages
          ? authApiErrorMessages[code as keyof typeof authApiErrorMessages]
          : rawMessage;

      return new AuthApiError(mappedMessage, {
        code,
        statusCode:
          ("statusCode" in responseData &&
          typeof (responseData as { statusCode?: unknown }).statusCode ===
            "number"
            ? (responseData as { statusCode: number }).statusCode
            : undefined) ?? statusCode,
        details:
          "details" in responseData
            ? (responseData as { details?: unknown }).details
            : undefined,
      });
    }
  }

  if (error instanceof AuthApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new AuthApiError(error.message, {
      statusCode: undefined,
    });
  }

  return new AuthApiError(fallbackMessage);
}
