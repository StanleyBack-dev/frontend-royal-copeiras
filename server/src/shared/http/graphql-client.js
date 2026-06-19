import axios from "axios";
import { config } from "../../config/env.js";
import { HttpError } from "./http-error.js";
import { logEvent, summarizePayload } from "../observability/logger.js";
import { devAuthConfig } from "../auth/dev-auth.config.js";
import { getDevAuthHeaders } from "../auth/dev-auth.provider.js";
import {
  recordGraphqlCompleted,
  recordGraphqlRetry,
  recordGraphqlStart,
} from "../observability/metrics-store.js";

const graphqlHttp = axios.create({
  baseURL: config.backendGraphqlUrl,
  timeout: config.graphqlRequestTimeoutMs,
  headers: {
    "Content-Type": "application/json",
  },
});

function isObject(value) {
  return typeof value === "object" && value !== null;
}

function extractGraphqlError(payload, fallbackMessage) {
  if (!isObject(payload)) {
    return {
      message: fallbackMessage,
      statusCode: undefined,
      code: undefined,
      details: undefined,
    };
  }

  const firstGraphqlError = Array.isArray(payload.errors)
    ? payload.errors[0]
    : undefined;

  if (!isObject(firstGraphqlError)) {
    const payloadMessage =
      typeof payload.message === "string" ? payload.message : fallbackMessage;
    const payloadStatusCode =
      typeof payload.statusCode === "number" ? payload.statusCode : undefined;
    const payloadCode =
      typeof payload.code === "string" ? payload.code : undefined;
    const payloadDetails = "details" in payload ? payload.details : undefined;

    return {
      message: payloadMessage,
      statusCode: payloadStatusCode,
      code: payloadCode,
      details: payloadDetails,
    };
  }

  const extensions = isObject(firstGraphqlError.extensions)
    ? firstGraphqlError.extensions
    : {};

  return {
    message:
      typeof firstGraphqlError.message === "string"
        ? firstGraphqlError.message
        : fallbackMessage,
    statusCode:
      typeof extensions.statusCode === "number"
        ? extensions.statusCode
        : undefined,
    code: typeof extensions.code === "string" ? extensions.code : undefined,
    details: "details" in extensions ? extensions.details : undefined,
  };
}

function shouldRetry(error) {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  if (!error.response) {
    return true;
  }

  return error.response.status >= 500 || error.response.status === 429;
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getRetryDelay(attemptIndex) {
  const exponential = config.graphqlRetryBaseDelayMs * 2 ** attemptIndex;
  const jitter = Math.floor(Math.random() * 50);
  return exponential + jitter;
}

function getOperationName(query) {
  const match = query.match(/(query|mutation)\s+([A-Za-z0-9_]+)/);
  return match?.[2] || "anonymous_operation";
}

async function postGraphqlWithRetry(requestBody, headers, metadata = {}) {
  let lastError;

  for (let attempt = 0; attempt <= config.graphqlMaxRetries; attempt += 1) {
    try {
      logEvent("info", "graphql.request.attempt", {
        requestId: metadata.requestId,
        operationName: metadata.operationName,
        attempt,
        maxRetries: config.graphqlMaxRetries,
        variables: summarizePayload(requestBody.variables),
      });

      return await graphqlHttp.post("", requestBody, { headers });
    } catch (error) {
      lastError = error;

      const canRetry = shouldRetry(error);
      const isLastAttempt = attempt >= config.graphqlMaxRetries;

      if (!canRetry || isLastAttempt) {
        logEvent("error", "graphql.request.failed", {
          requestId: metadata.requestId,
          operationName: metadata.operationName,
          attempt,
          canRetry,
          statusCode: axios.isAxiosError(error)
            ? error.response?.status
            : undefined,
          message: error?.message,
        });
        throw error;
      }

      const retryDelayMs = getRetryDelay(attempt);

      recordGraphqlRetry({
        requestId: metadata.requestId,
        operationName: metadata.operationName,
        attempt: attempt + 1,
        delayMs: retryDelayMs,
      });

      logEvent("warn", "graphql.request.retrying", {
        requestId: metadata.requestId,
        operationName: metadata.operationName,
        nextAttempt: attempt + 1,
        delayMs: retryDelayMs,
      });

      await wait(retryDelayMs);
    }
  }

  throw lastError;
}

export async function executeGraphql({
  query,
  variables,
  userId,
  authorization,
  cookieHeader,
  requestId,
}) {
  const operationName = getOperationName(query);
  const startedAt = Date.now();

  recordGraphqlStart({ requestId, operationName });

  logEvent("info", "graphql.request.started", {
    requestId,
    operationName,
    userId,
    hasAuthorization: Boolean(authorization),
  });

  try {
    const resolvedAuthHeaders = authorization
      ? { Authorization: authorization }
      : cookieHeader
        ? { Cookie: cookieHeader }
        : devAuthConfig.enabled
          ? await getDevAuthHeaders()
          : {};

    const forwardHeaders = {
      ...(userId ? { "x-user-id": userId } : {}),
      ...resolvedAuthHeaders,
    };

    const response = await postGraphqlWithRetry(
      { query, variables },
      forwardHeaders,
      {
        requestId,
        operationName,
      },
    );

    const payload = response.data;

    if (payload?.errors?.length) {
      const metadata = extractGraphqlError(payload, "Upstream GraphQL error.");
      throw new HttpError(metadata.statusCode ?? 502, metadata.message, {
        code: metadata.code,
        details: metadata.details,
      });
    }

    if (!payload?.data) {
      throw new HttpError(502, "Invalid GraphQL response payload.");
    }

    const durationMs = Date.now() - startedAt;

    recordGraphqlCompleted({
      requestId,
      operationName,
      status: "success",
      durationMs,
    });

    logEvent("info", "graphql.request.completed", {
      requestId,
      operationName,
      durationMs,
      statusCode: response.status,
      response: summarizePayload(payload.data),
    });

    return payload.data;
  } catch (error) {
    const durationMs = Date.now() - startedAt;

    recordGraphqlCompleted({
      requestId,
      operationName,
      status: "error",
      durationMs,
      errorMessage: error?.message,
    });

    if (error instanceof HttpError) {
      logEvent("error", "graphql.request.error", {
        requestId,
        operationName,
        durationMs,
        statusCode: error.statusCode,
        message: error.message,
      });

      throw error;
    }

    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 502;
      const metadata = extractGraphqlError(
        error.response?.data,
        error.message || "GraphQL request failed.",
      );
      const statusCode = metadata.statusCode ?? status;
      const upstreamMessage = metadata.message;

      logEvent("error", "graphql.request.error", {
        requestId,
        operationName,
        durationMs,
        statusCode,
        message: upstreamMessage,
        upstream: summarizePayload(error.response?.data),
      });

      throw new HttpError(statusCode, upstreamMessage, {
        code: metadata.code,
        details: metadata.details,
      });
    }

    logEvent("error", "graphql.request.error", {
      requestId,
      operationName,
      durationMs,
      message: error?.message || "Unexpected server error.",
    });

    throw new HttpError(500, "Unexpected server error.");
  }
}
