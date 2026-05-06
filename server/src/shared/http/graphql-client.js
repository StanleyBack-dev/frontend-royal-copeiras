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
      const firstError = payload.errors[0];
      const message = firstError?.message || "Upstream GraphQL error.";
      throw new HttpError(502, message);
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
      const upstreamMessage =
        error.response?.data?.errors?.[0]?.message ||
        error.response?.data?.message ||
        error.message ||
        "GraphQL request failed.";

      logEvent("error", "graphql.request.error", {
        requestId,
        operationName,
        durationMs,
        statusCode: status,
        message: upstreamMessage,
        upstream: summarizePayload(error.response?.data),
      });

      throw new HttpError(status, upstreamMessage);
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
