import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

export const config = {
  port: toNumber(process.env.BFF_PORT, 5000),
  backendGraphqlUrl:
    process.env.BACKEND_GRAPHQL_URL || "http://localhost:4000/graphql",
  graphqlRequestTimeoutMs: toNumber(process.env.BFF_GRAPHQL_TIMEOUT_MS, 10000),
  graphqlMaxRetries: toNumber(process.env.BFF_GRAPHQL_MAX_RETRIES, 2),
  graphqlRetryBaseDelayMs: toNumber(
    process.env.BFF_GRAPHQL_RETRY_BASE_DELAY_MS,
    150,
  ),
  listCacheTtlMs: toNumber(process.env.BFF_LIST_CACHE_TTL_MS, 15000),
  observabilityLogsEnabled: toBoolean(
    process.env.BFF_OBSERVABILITY_LOGS_ENABLED,
    true,
  ),
  observabilityLogPayloadMaxChars: toNumber(
    process.env.BFF_OBSERVABILITY_LOG_PAYLOAD_MAX_CHARS,
    1500,
  ),
  observabilityRecentEventsLimit: toNumber(
    process.env.BFF_OBSERVABILITY_RECENT_EVENTS_LIMIT,
    200,
  ),
};
