import axios, {
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { AuthSessionResponseSchema } from "../auth/schema";
import {
  clearStoredAuthSession,
  clearStoredPagePermissions,
} from "../../features/auth/utils/sessionStorage";
import {
  emitAuthSessionCleared,
  emitAuthSessionRefreshed,
} from "../../features/auth/utils/auth-session-events";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "")
  .trim()
  .replace(/\/+$/, "");

function buildApiUrl(path: string): string {
  if (!apiBaseUrl) {
    return path;
  }

  return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export const httpClient = axios.create({
  baseURL: apiBaseUrl || undefined,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAuthEndpointUrl(url: string | undefined): boolean {
  return (
    typeof url === "string" &&
    ["/api/auth/login", "/api/auth/refresh", "/api/auth/logout"].some((path) =>
      url.includes(path),
    )
  );
}

function hasUnauthorizedGraphqlError(payload: unknown): boolean {
  if (!isObject(payload) || !Array.isArray(payload.errors)) {
    return false;
  }

  return payload.errors.some((error) => {
    if (!isObject(error) || !isObject(error.extensions)) {
      return false;
    }

    return error.extensions.statusCode === 401;
  });
}

httpClient.interceptors.request.use((config) => {
  try {
    if (config && config.headers) {
      delete config.headers["x-user-id"];
      delete config.headers["X-User-Id"];
    }
  } catch (e) {
    void e;
  }

  return config;
});

let refreshRequest: Promise<void> | null = null;
let redirectingToLogin = false;

function clearAuthStateAndRedirect() {
  if (redirectingToLogin) {
    return;
  }

  redirectingToLogin = true;
  clearStoredAuthSession();
  clearStoredPagePermissions();
  emitAuthSessionCleared();

  if (typeof window !== "undefined") {
    window.location.replace("/");
  }
}

async function refreshSessionOrFail(): Promise<void> {
  if (!refreshRequest) {
    refreshRequest = (async () => {
      try {
        const response = await axios.post<unknown>(
          buildApiUrl("/api/auth/refresh"),
          {},
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const parsed = AuthSessionResponseSchema.safeParse(response.data);

        if (!parsed.success || !parsed.data.authenticated) {
          throw new Error("Resposta de refresh de sessao invalida.");
        }

        emitAuthSessionRefreshed(parsed.data);
      } finally {
        refreshRequest = null;
      }
    })();
  }

  await refreshRequest;
}

async function retryAfterRefresh(
  requestConfig: RetriableRequestConfig | undefined,
) {
  if (
    !requestConfig ||
    requestConfig._retry ||
    isAuthEndpointUrl(requestConfig.url)
  ) {
    return null;
  }

  requestConfig._retry = true;

  try {
    await refreshSessionOrFail();
    return httpClient(requestConfig);
  } catch (refreshError) {
    clearAuthStateAndRedirect();
    throw refreshError;
  }
}

httpClient.interceptors.response.use(
  async (response: AxiosResponse<unknown>) => {
    const retriedResponse = await retryAfterRefresh(
      hasUnauthorizedGraphqlError(response.data)
        ? (response.config as RetriableRequestConfig | undefined)
        : undefined,
    );

    return retriedResponse ?? response;
  },
  async (error) => {
    const statusCode = error.response?.status;
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (statusCode !== 401) {
      return Promise.reject(error);
    }

    try {
      const retriedResponse = await retryAfterRefresh(originalRequest);

      if (retriedResponse) {
        return retriedResponse;
      }
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }

    return Promise.reject(error);
  },
);
